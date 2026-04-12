'use client';

import { useState, useRef, useMemo } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, SaveAll, Info, Database, Shield, ChevronRight, ChevronDown, Sparkles, Orbit, Star, Zap, Layers3, Globe2, History, Clock } from 'lucide-react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PreviewRow {
  groupCode: string;
  groupTitle: string;
  subCode: string;
  subTitle: string;
  notes: string | null;
  description?: string;
}

interface UploadResult {
  versionId: string;
  itemCount: number;
  parseErrors: string[];
  preview: PreviewRow[];
}

interface TreeGroup {
  groupCode: string;
  groupTitle: string;
  children: PreviewRow[];
}

interface MasterVersion {
  id: string;
  version_no: number;
  file_name: string;
  uploaded_at: string;
  is_active: boolean;
  item_count: number;
  uploaded_by: string;
  doc_title: string | null;
  doc_period: string | null;
}

type Status = 'idle' | 'uploading' | 'preview' | 'publishing' | 'done';

// ── Tree Node Component (Light Theme) ──
function CosmicTreeNode({ group, index }: { group: TreeGroup; index: number }) {
  const [expanded, setExpanded] = useState(index < 3); // First 3 groups expanded

  const orbitColors = [
    'from-indigo-500 to-indigo-600 text-white',
    'from-blue-500 to-cyan-600 text-white',
    'from-emerald-500 to-teal-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-500 to-pink-600 text-white',
    'from-violet-500 to-purple-600 text-white',
  ];
  const orbIdx = index % orbitColors.length;
  const badgeClass = orbitColors[orbIdx];

  return (
    <div className="relative">
      {/* ── Group Node ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`group relative w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 border ${
          expanded 
            ? 'bg-white border-indigo-100 shadow-[0_4px_20px_rgb(0,0,0,0.06)]'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        {/* Icon ring */}
        <div className={`relative size-12 shrink-0`}>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badgeClass} opacity-10`} />
          <div className={`relative size-12 rounded-full bg-gradient-to-br ${badgeClass} flex items-center justify-center shadow-sm`}>
            <span className="font-black text-[11px] font-mono tracking-tight">{group.groupCode}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors">
            {group.groupTitle || `Nhóm mục ${group.groupCode}`}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {group.children.length} tiểu mục
            </span>
            <span className="size-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-mono text-slate-400">
              {group.groupCode}xx
            </span>
          </div>
        </div>

        {/* Expand chevron */}
        <div className={`size-8 rounded-lg flex items-center justify-center transition-all ${expanded ? 'bg-slate-100 rotate-0' : 'bg-slate-50 -rotate-90'}`}>
          <ChevronDown className="size-4 text-slate-400" />
        </div>

        {/* Child count badge */}
        <div className={`absolute -top-2 -right-2 size-7 rounded-full bg-gradient-to-br ${badgeClass} flex items-center justify-center shadow-sm text-[10px] font-black border-2 border-white`}>
          {group.children.length}
        </div>
      </button>

      {/* ── Sub-code Children ── */}
      {expanded && (
        <div className="relative mt-2 ml-6 border-l-2 border-slate-100 pl-0 space-y-2 mb-4">
          {group.children.map((child, ci) => (
            <div key={ci} className="relative flex group/item">
              {/* Connector line */}
              <div className="absolute -left-[2px] top-6 w-6 h-px bg-slate-200" />
              <div className={`absolute -left-[5px] top-[21px] size-2 rounded-full bg-gradient-to-br ${badgeClass}`} />

              {/* Satellite card */}
              <div className="flex-1 ml-6 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm cursor-default">
                <div className="flex items-start gap-3">
                  {/* Sub-code badge */}
                  <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black font-mono bg-gradient-to-br ${badgeClass} shadow-sm`}>
                    {child.subCode}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-800 leading-relaxed">
                      {child.subTitle}
                    </p>
                    {child.description && (
                      <ul className="mt-2 space-y-1">
                        {child.description.split('\n').map((line, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 leading-relaxed flex items-start gap-1.5">
                            <span className="text-slate-400 mt-0.5">•</span>
                            <span>{line.replace(/^[\*•\-\+]\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {child.notes && (
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed border-l-2 border-slate-300 pl-2.5">
                        {child.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UploadMasterPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: versionsRes, mutate: mutateVersions } = useSWR<{ data: MasterVersion[] }>('/api/master-versions', fetcher);
  const versions = versionsRes?.data ?? [];

  // Build tree structure from flat preview data
  const treeData = useMemo<TreeGroup[]>(() => {
    if (!result?.preview) return [];
    const map = new Map<string, TreeGroup>();
    for (const row of result.preview) {
      const key = row.groupCode;
      if (!map.has(key)) {
        map.set(key, { groupCode: key, groupTitle: row.groupTitle, children: [] });
      }
      map.get(key)!.children.push(row);
    }
    return Array.from(map.values());
  }, [result]);

  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return treeData;
    const q = searchTerm.toLowerCase();
    return treeData
      .map(group => ({
        ...group,
        children: group.children.filter(c =>
          c.subCode.toLowerCase().includes(q) ||
          c.subTitle.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          c.groupCode.includes(q)
        ),
      }))
      .filter(g => g.children.length > 0 || g.groupCode.includes(q) || g.groupTitle.toLowerCase().includes(q));
  }, [treeData, searchTerm]);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error('Lỗi: Chưa chọn tập tin'); return; }

    setStatus('uploading');
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/upload-master-file', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error ?? 'Lỗi hệ thống trong quá trình trích xuất'); setStatus('idle'); return; }

      setResult(data as UploadResult);
      setStatus('preview');
      toast.success(`Trích xuất thành công: ${data.itemCount} bản ghi`);
    } catch {
      toast.error('Lỗi kết nối đường truyền');
      setStatus('idle');
    }
  }

  async function handlePublish(overrideVersionId?: string) {
    const versionToPublish = overrideVersionId || result?.versionId;
    if (!versionToPublish) return;
    
    if (!overrideVersionId) setStatus('publishing');

    try {
      const res = await fetch('/api/publish-master-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: versionToPublish }),
      });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error ?? 'Lỗi triển khai dữ liệu'); setStatus(result ? 'preview' : 'idle'); return; }

      if (result) setStatus('done');
      else { setStatus('idle'); mutateVersions(); }
      toast.success(`Cập nhật thành công: ${data.activatedItems} bản ghi đã được đưa vào sử dụng`);
    } catch {
      toast.error('Lỗi kết nối đường truyền');
      setStatus(result ? 'preview' : 'idle');
    }
  }

  async function handleRestoreVersion(versionId: string) {
    if (!window.confirm('Bạn có chắc chắn muốn TRIỂN KHAI phiên bản này và đưa vào sử dụng làm Kho dữ liệu hiện tại?')) return;
    await handlePublish(versionId);
  }

  function handleReset() {
    setStatus('idle');
    setResult(null);
    setSelectedFile('');
    setSearchTerm('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">

        {/* ── Header ── */}
        <header className="mb-6 pb-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
              <Database className="size-3.5 text-indigo-600" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kho Dữ Liệu</span>
            <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[9px] rounded-full font-bold tracking-wider flex items-center gap-1 shadow-sm">
              <Shield className="size-2.5" />
              ADMIN
            </span>
          </div>
          
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Cập nhật Danh mục Kho bạc
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                Nhập khẩu tệp Excel để đồng bộ hóa cấu trúc phân loại ngân sách TABMIS.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">

        {/* ── Upload Zone ── */}
        {(status === 'idle' || status === 'uploading') && (
          <div className="animate-fade-in-up space-y-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
            
            <label
              htmlFor="admin-file-upload"
              className={`flex flex-col items-center justify-center w-full h-52 rounded-2xl cursor-pointer transition-all duration-300 group border-2 border-dashed relative overflow-hidden
                ${selectedFile 
                  ? 'border-indigo-400 bg-indigo-50/50' 
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
            >
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className={`size-16 rounded-2xl flex items-center justify-center transition-all border shadow-sm ${
                  selectedFile 
                    ? 'bg-indigo-100 text-indigo-600 border-indigo-200' 
                    : 'bg-slate-100 text-slate-400 border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100'
                }`}>
                  <FileSpreadsheet className="size-7" />
                </div>
                {selectedFile ? (
                  <div className="text-center">
                    <p className="font-bold text-sm text-indigo-700">{selectedFile}</p>
                    <p className="text-xs mt-1 text-indigo-500/70">Tệp dữ liệu đã sẵn sàng để xử lý</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-semibold text-sm text-slate-600">Kéo thả hoặc nhấp để chọn tệp</p>
                    <p className="text-xs mt-1 text-slate-400">Chỉ chấp nhận .xls và .xlsx tuân thủ cấu trúc MLNS</p>
                  </div>
                )}
              </div>
              <input
                id="admin-file-upload"
                ref={fileRef}
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={e => setSelectedFile(e.target.files?.[0]?.name ?? '')}
              />
            </label>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleUpload}
                disabled={status === 'uploading' || !selectedFile}
                className="rounded-xl px-8 py-2.5 bg-indigo-600 text-white font-bold text-sm shadow-[0_2px_10px_rgb(79,70,229,0.2)] hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
              >
                {status === 'uploading' ? (
                  <><Loader2 className="size-4 animate-spin" /> Đang phân tích...</>
                ) : (
                  <><Upload className="size-4" /> Bắt đầu trích xuất</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Cosmic Tree Preview ── */}
        {(status === 'preview' || status === 'publishing' || status === 'done') && result && (
          <div className="space-y-5 animate-fade-in-up">
            
            {/* Status banner */}
            <div className={`p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border shadow-sm ${
              status === 'done' 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-indigo-50 border-indigo-200'
            }`}>
              <div className="flex items-start gap-4">
                {status === 'done' ? (
                  <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200 shadow-sm">
                    <Sparkles className="size-5 text-indigo-600" />
                  </div>
                )}
                <div>
                  <h3 className={`font-bold text-base ${status === 'done' ? 'text-emerald-800' : 'text-indigo-800'}`}>
                    {status === 'done' ? '✦ Triển khai thành công' : '✦ Chờ xác nhận ban hành'}
                  </h3>
                  <p className="text-sm mt-0.5 text-slate-600">
                    <strong className="text-slate-900">{result.itemCount}</strong> tiểu mục hợp lệ • <strong className="text-slate-900">{filteredTree.length}</strong> nhóm mục • Lỗi: <strong className="text-slate-900">{result.parseErrors.length}</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                {status !== 'done' && (
                  <button
                    onClick={handlePublish}
                    disabled={status === 'publishing'}
                    className="rounded-xl px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm shadow-[0_2px_10px_rgb(79,70,229,0.3)] hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {status === 'publishing' ? <Loader2 className="size-4 animate-spin" /> : <SaveAll className="size-4" />}
                    Phê duyệt & Triển khai
                  </button>
                )}
                <button onClick={handleReset} className="font-bold text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  {status === 'done' ? 'Trở về' : 'Hủy bỏ'}
                </button>
              </div>
            </div>

            {/* Parse errors */}
            {result.parseErrors.length > 0 && (
              <div className="border border-red-200 bg-red-50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="size-5 shrink-0 text-red-500" />
                  <span className="font-bold text-sm text-red-900">Báo cáo lỗi ({result.parseErrors.length})</span>
                </div>
                <ul className="space-y-2 bg-white border border-red-100 p-4 rounded-xl text-sm text-slate-700 overflow-y-auto max-h-40">
                  {result.parseErrors.map((errMsg, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold text-red-500 shrink-0 font-mono text-xs">#{i + 1}</span>
                      <span>{typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Tree View ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
              
              {/* Tree header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center shadow-sm">
                    <Layers3 className="size-4 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-600 uppercase tracking-[0.15em]">
                      Cây phân cấp MLNS
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {filteredTree.length} nhóm mục • {result.preview.length} tiểu mục
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-[280px]">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm tiểu mục, nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded-lg bg-white border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Tree content */}
              <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto scrollbar-thin" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 transparent',
              }}>
                {filteredTree.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium text-sm">Không tìm thấy kết quả cho &quot;{searchTerm}&quot;</p>
                  </div>
                ) : (
                  filteredTree.map((group, idx) => (
                    <CosmicTreeNode key={group.groupCode} group={group} index={idx} />
                  ))
                )}
              </div>
            </div>

          </div>
        )}
          </div> {/* End Left Column */}

        {/* ── Version History ── */}
        {versions.length > 0 && (
          <div className="lg:col-span-4 sticky top-6 animate-fade-in-up bg-white/70 backdrop-blur-2xl rounded-3xl border border-white max-h-[85vh] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
            <div className="px-6 py-5 border-b border-slate-100/50 flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center shadow-sm">
                  <History className="size-4 text-indigo-600" />
                </div>
                <h2 className="text-[15px] font-black text-slate-800 tracking-tight">
                  Kho dữ liệu Hệ thống
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium pl-11">
                Lịch sử {versions.length} lần tải lên gần nhất
              </p>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3 scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
              {versions.map((ver) => (
                <div key={ver.id} className={`p-4 rounded-2xl flex flex-col gap-3 transition-all border ${ver.is_active ? 'bg-gradient-to-b from-indigo-50/80 to-white border-indigo-100 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/10' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}>
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded text-white shadow-sm ${ver.is_active ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                        v{ver.version_no}
                      </span>
                      {ver.is_active && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle2 className="size-3" /> Đang sử dụng
                        </span>
                      )}
                    </div>
                    {status === 'idle' && !ver.is_active && (
                      <button
                        onClick={() => handleRestoreVersion(ver.id)}
                        className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-[10px] uppercase text-slate-600 rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        Triển khai
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2" title={ver.file_name}>
                      {ver.doc_title || ver.file_name}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" /> {formatDate(ver.uploaded_at)}
                       </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 mt-1 border-t border-slate-100/80 overflow-x-auto scrollbar-none">
                    <span className="text-[11px] font-medium shrink-0 text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <Layers3 className="size-3.5 text-indigo-400" />
                      <strong className="text-slate-700">{ver.item_count}</strong> khoản mục
                    </span>
                    {ver.doc_period && (
                      <span className="text-[11px] font-medium shrink-0 text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Orbit className="size-3.5 text-indigo-400" />
                        <span className="text-slate-700">{ver.doc_period}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        </div>
      </div>
    </div>
  );
}

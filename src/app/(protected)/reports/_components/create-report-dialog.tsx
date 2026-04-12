'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function CreateReportDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Lỗi tạo phiếu'); return; }
      toast.success('Tạo phiếu thành công');
      router.push(`/reports/${data.reportId}`);
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-bold hover:from-indigo-400 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        Tạo báo cáo mới
      </button>
    );
  }

  return (
    <div className="flex items-stretch gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5 animate-scale-in">
      {/* Icon */}
      <div className="hidden sm:flex size-12 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center shrink-0 shadow-sm">
        <FileText className="size-5 text-indigo-600" />
      </div>

      {/* Input */}
      <div className="flex-1 min-w-[250px] flex flex-col justify-center">
        <label htmlFor="report-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">
          Tên báo cáo hạch toán
        </label>
        <input
          id="report-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="VD: Chi phí công tác quý 2/2025..."
          className="w-full h-10 px-3.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
      </div>

      {/* Actions */}
      <div className="flex items-end gap-2">
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-sm hover:from-indigo-400 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/15 active:scale-95"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" strokeWidth={2.5} />}
          Khởi tạo
        </button>
        <button
          className="size-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 border border-slate-200"
          onClick={() => { setOpen(false); setName(''); }}
          aria-label="Đóng"
        >
          <X className="size-4.5" />
        </button>
      </div>
    </div>
  );
}

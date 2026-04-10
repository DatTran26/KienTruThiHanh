'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X } from 'lucide-react';
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
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 font-bold px-5 h-9 bg-primary hover:bg-slate-800 text-white shadow-sm transition-colors"
      >
        <Plus className="size-4" />
        Tạo báo cáo mới
      </Button>
    );
  }

  return (
    <div
      className="flex items-end gap-3 p-4 rounded-lg bg-white border border-slate-200 shadow-lg animate-fade-in"
    >
      <div className="space-y-1.5 flex-1 min-w-[250px]">
        <Label htmlFor="report-name" className="text-sm font-semibold text-slate-700">
          Tên báo cáo hạch toán
        </Label>
        <Input
          id="report-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="VD: Chi phí công tác quý 2/2025..."
          className="w-full h-10 text-sm bg-slate-50 border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
      </div>
      <Button
        onClick={handleCreate}
        disabled={loading || !name.trim()}
        className="gap-1.5 font-bold h-10 px-5 bg-primary hover:bg-slate-800 text-white"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Khởi tạo
      </Button>
      <Button
        variant="ghost"
        className="h-10 w-10 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shrink-0"
        onClick={() => { setOpen(false); setName(''); }}
      >
        <X className="size-5" />
      </Button>
    </div>
  );
}

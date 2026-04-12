'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ExportButton({ reportId, reportName }: { reportId: string; reportName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/export`);
      if (!res.ok) {
        const text = await res.text();
        toast.error(text || 'Lỗi xuất PDF');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phieu-thanh-toan-${reportName.slice(0, 30).replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('Tải PDF thành công');
      // Reload to reflect exported status
      window.location.reload();
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleExport} 
      disabled={loading} 
      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:from-red-400 hover:to-red-500 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {loading ? 'Đang tạo PDF...' : 'Xuất PDF'}
    </button>
  );
}

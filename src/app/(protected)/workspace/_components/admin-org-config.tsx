'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AdminOrgConfig() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState({ unit_name: '', address: '', tax_code: '' });

  useEffect(() => {
    fetch('/api/admin/org-reference')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setValues({
            unit_name: data.unit_name || '',
            address: data.address || '',
            tax_code: data.tax_code || '',
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/org-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Có lỗi xảy ra khi lưu tham số');
      } else {
        toast.success('Lưu tham số thành công! Toàn bộ người dùng sẽ phải định danh lại theo chuẩn mới.');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-8 mt-8 border border-indigo-100 flex items-center justify-center h-48">
        <Loader2 className="size-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-8 mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-800/80 relative overflow-hidden">
      {/* Decorative background lines */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
            <Settings className="size-5 text-indigo-300" />
          </div>
          <div>
             <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
                ⚙️ Bộ Tham số Định danh
             </h3>
             <p className="text-[11px] text-indigo-300 uppercase tracking-widest font-bold mt-1">Dành riêng cho System Admin</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
           <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
              <AlertCircle className="size-5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200/90 leading-relaxed font-medium">
                Cảnh báo: Thay đổi bộ chuẩn này sẽ đặt lại trạng thái xác minh của <strong>tất cả người dùng</strong> hiện tại về "Chưa xác minh".
              </p>
           </div>

           <div className="space-y-3">
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Tên đơn vị chuẩn</label>
                 <input 
                   value={values.unit_name}
                   onChange={e => setValues(v => ({ ...v, unit_name: e.target.value }))}
                   className="w-full bg-black/20 border border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl px-4 py-2.5 text-white text-sm transition-all outline-none font-medium placeholder:text-white/20"
                   placeholder="VD: Viện kiểm sát nhân dân khu vực 5"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Địa chỉ trụ sở chuẩn</label>
                 <input 
                   value={values.address}
                   onChange={e => setValues(v => ({ ...v, address: e.target.value }))}
                   className="w-full bg-black/20 border border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl px-4 py-2.5 text-white text-sm transition-all outline-none font-medium placeholder:text-white/20"
                   placeholder="VD: Khu trung tâm hành chính..."
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Mã số thuế chuẩn</label>
                 <input 
                   value={values.tax_code}
                   onChange={e => setValues(v => ({ ...v, tax_code: e.target.value }))}
                   className="w-full bg-black/20 border border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl px-4 py-2.5 text-amber-300 font-mono text-lg font-bold transition-all outline-none tracking-widest placeholder:text-white/20"
                   placeholder="Mã số thuế"
                   maxLength={14}
                 />
              </div>
           </div>
        </div>

        <button 
           onClick={handleSave}
           disabled={isSaving || !values.unit_name || !values.tax_code || !values.address}
           className="w-full rounded-xl px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Lưu Tham số Hệ thống
        </button>
      </div>
    </div>
  );
}

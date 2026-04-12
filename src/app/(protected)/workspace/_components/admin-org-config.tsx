'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, Loader2, AlertCircle, Database, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AdminOrgConfig() {
  const router = useRouter();
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
        router.refresh();
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
    <div className="bg-slate-50/80 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 mt-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-200/50 relative overflow-hidden animate-fade-in">
      {/* Dynamic atmospheric background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6 pb-5 border-b border-slate-200/50">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200/50 group/icon relative">
             <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
             <Settings className="size-5 text-white relative z-10 animate-spin-slow" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-black text-lg lg:text-xl tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Tham số Định danh Hệ thống
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               <span className="text-[9px] text-indigo-500/80 uppercase tracking-[0.2em] font-black bg-white px-2.5 py-0.5 rounded-lg border border-indigo-100 shadow-sm">Privileged</span>
               <span className="text-[9px] text-violet-500/80 uppercase tracking-[0.2em] font-black bg-white px-2.5 py-0.5 rounded-lg border border-violet-100 shadow-sm">Secure</span>
            </div>
          </div>
        </div>

        <div className="space-y-5 mb-6">
          <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl p-3 flex gap-3 relative overflow-hidden group/alert shadow-sm shadow-amber-500/5">
            <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
            <AlertCircle className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed font-bold">
              <strong className="text-amber-600 font-black uppercase tracking-wider block mb-0.5">Cảnh báo bảo mật:</strong>
              Các thay đổi sẽ tái thiết lập trạng thái định danh của <span className="text-amber-600 underline underline-offset-4">tất cả người dùng</span>.
            </p>
          </div>

          <div className="grid gap-4">
            {/* Input Group 1 */}
            <div className="space-y-1.5 group/field">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 group-focus-within/field:text-indigo-600 transition-colors">
                <div className="size-1.5 rounded-full bg-indigo-400" />
                Đơn vị chuẩn
              </label>
              <div className="relative">
                <input
                  value={values.unit_name}
                  onChange={e => setValues(v => ({ ...v, unit_name: e.target.value }))}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-400 focus:ring-[6px] focus:ring-indigo-500/5 rounded-xl px-4 py-3 text-slate-700 text-sm transition-all outline-none font-black placeholder:text-slate-300 shadow-sm"
                  placeholder="Official Name..."
                />
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-indigo-400/40 group-focus-within/field:text-indigo-500 transition-colors" />
              </div>
            </div>

            {/* Input Group 2 */}
            <div className="space-y-1.5 group/field">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 group-focus-within/field:text-violet-600 transition-colors">
                 <div className="size-1.5 rounded-full bg-violet-400" />
                Địa chỉ pháp lý
              </label>
              <div className="relative">
                <input
                  value={values.address}
                  onChange={e => setValues(v => ({ ...v, address: e.target.value }))}
                  className="w-full bg-white border border-slate-200 focus:border-violet-400 focus:ring-[6px] focus:ring-violet-500/5 rounded-xl px-4 py-3 text-slate-700 text-sm transition-all outline-none font-bold placeholder:text-slate-300 shadow-sm"
                  placeholder="Legal Base Address..."
                />
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-violet-400/40 group-focus-within/field:text-violet-500 transition-colors" />
              </div>
            </div>

            {/* Input Group 3 */}
            <div className="space-y-1.5 group/field">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 group-focus-within/field:text-emerald-600 transition-colors">
                 <div className="size-1.5 rounded-full bg-emerald-400" />
                Mã số thuế gốc
              </label>
              <div className="relative">
                <input
                  value={values.tax_code}
                  onChange={e => setValues(v => ({ ...v, tax_code: e.target.value }))}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-[6px] focus:ring-emerald-500/5 rounded-xl px-4 py-3 text-emerald-600 font-black text-base lg:text-lg transition-all outline-none tracking-[0.3em] placeholder:text-slate-300 shadow-sm"
                  placeholder="TAX-NUMBER"
                  maxLength={14}
                />
                <Database className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-emerald-400/40 group-focus-within/field:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !values.unit_name || !values.tax_code || !values.address}
          className="w-full group/btn relative rounded-xl px-6 py-3.5 bg-slate-900 text-white font-black text-[11px] transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-2 uppercase tracking-[0.3em] overflow-hidden shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {isSaving ? (
            <Loader2 className="size-4 animate-spin relative z-10" />
          ) : (
            <Save className="size-4 relative z-10 group-hover:scale-110 transition-transform" />
          )}
          <span className="relative z-10">Cập nhật tham số hệ thống</span>
          
          <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
        </button>
      </div>
    </div>
  );
}

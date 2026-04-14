'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, Loader2, AlertCircle, Database, Building2, MapPin, Power, UserPlus, Mail, Lock, ShieldCheck, Wand2, Download, Copy, CheckCircle2, ClipboardList, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function AdminOrgConfig({ initialTab }: { initialTab?: 'org' | 'system' | 'users' | null }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'org' | 'system' | 'users'>(
    (initialTab && ['org', 'system', 'users'].includes(initialTab)) ? initialTab : 'org'
  );
  
  // Org State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState({ unit_name: '', address: '', tax_code: '' });

  // System State
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [isSavingSystem, setIsSavingSystem] = useState(false);

  // User State
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' as 'admin'|'user' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Bulk User State
  const [bulkTotal, setBulkTotal] = useState(10);
  const [bulkAdminCount, setBulkAdminCount] = useState(0);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<{email: string, password: string, role: string, status: string}[]>([]);
  const [copiedRow, setCopiedRow] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [singleCreateSuccess, setSingleCreateSuccess] = useState<string | null>(null);

  // Ref to measure the form card height
  const formRef = useRef<HTMLFormElement>(null);
  const [formHeight, setFormHeight] = useState<number>(0);

  useEffect(() => {
    if (!formRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setFormHeight(entry.contentRect.height + 48); // + padding
      }
    });
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load Org Config
        const res = await fetch('/api/admin/org-reference');
        const data = await res.json();
        if (!data.error) {
          setValues({
            unit_name: data.unit_name || '',
            address: data.address || '',
            tax_code: data.tax_code || '',
          });
        }
        
        // Load System Settings
        const supabase = createClient();
        const { data: settingsData } = await supabase
          .from('system_settings')
          .select('allow_registration')
          .eq('id', 1)
          .single();
          
        if (settingsData) {
          setAllowRegistration((settingsData as any).allow_registration);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSaveOrg = async () => {
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

  const handleToggleRegistration = async () => {
    setIsSavingSystem(true);
    const newValue = !allowRegistration;
    try {
      const supabase = createClient();
      const { error } = await (supabase.from('system_settings') as any).update({ allow_registration: newValue }).eq('id', 1);
      
      if (error) throw error;
      
      setAllowRegistration(newValue);
      toast.success(newValue ? 'Đã MỞ hệ thống đăng ký' : 'Đã ĐÓNG hệ thống đăng ký');
      router.refresh();
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setIsSavingSystem(false);
    }
  };

  /** Get Authorization headers with access token */
  const getAuthHeaders = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
    };
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      toast.error('Vui lòng nhập đủ email và mật khẩu');
      return;
    }
    
    setIsCreatingUser(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers,
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Lỗi tạo tài khoản');
      } else {
        toast.success(data.message);
        setSingleCreateSuccess(newUser.email);
        setNewUser({ email: '', password: '', role: 'user' });
        setTimeout(() => setSingleCreateSuccess(null), 4000);
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleBulkCreate = async () => {
    if (bulkTotal <= 0 || bulkTotal > 100) {
      toast.error('Số lượng không hợp lệ (cho phép từ 1 đến 100)');
      return;
    }
    
    setIsBulkCreating(true);
    setBulkProgress({ current: 0, total: bulkTotal });
    setBulkResults([]);
    
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const generatePass = () => Array.from({length: 12}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    
    // Tạo cấu trúc danh sách
    const queue = [];
    const randId = Math.floor(Math.random() * 9000) + 1000; // 4 chử số random cho đợt này
    
    // Push admins
    for (let i = 1; i <= bulkAdminCount; i++) {
      queue.push({ email: `admin_${randId}_${i}@vks.gov.vn`, password: generatePass(), role: 'admin' });
    }
    // Push users
    const userCount = bulkTotal - bulkAdminCount;
    for (let i = 1; i <= userCount; i++) {
      queue.push({ email: `user_${randId}_${i}@vks.gov.vn`, password: generatePass(), role: 'user' });
    }
    
    const results = [];
    
    // Gọi tuần tự
    for (let i = 0; i < queue.length; i++) {
      const u = queue[i];
      let status = 'Thành công';
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers,
          body: JSON.stringify(u),
        });
        if (!res.ok) {
          status = 'Lỗi';
        }
      } catch (err) {
        status = 'Lỗi mạng';
      }
      
      results.push({ ...u, status });
      setBulkProgress({ current: i + 1, total: bulkTotal });
      setBulkResults([...results]); // trigger render continually
    }
    
    setIsBulkCreating(false);
    toast.success('Đã hoàn tất tiến trình tạo hàng loạt');
  };

  const downloadBulkResults = () => {
    if (!bulkResults.length) return;
    const header = ['Email', 'Password', 'Role', 'Status'].join(',');
    const rows = bulkResults.map(r => [r.email, r.password, r.role, r.status].join(','));
    const csvContent = [header, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `accounts_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyRow = (index: number) => {
    const r = bulkResults[index];
    const text = `${r.email}\t${r.password}\t${r.role}`;
    navigator.clipboard.writeText(text);
    setCopiedRow(index);
    setTimeout(() => setCopiedRow(null), 1500);
  };

  const copyAllResults = () => {
    const header = 'Email\tPassword\tRole';
    const rows = bulkResults.map(r => `${r.email}\t${r.password}\t${r.role}`);
    navigator.clipboard.writeText([header, ...rows].join('\n'));
    setCopiedAll(true);
    toast.success('Đã copy toàn bộ bảng!');
    setTimeout(() => setCopiedAll(false), 2000);
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

      <div className={cn("relative z-10 mx-auto transition-all duration-300", activeTab === 'users' ? "max-w-6xl" : "max-w-2xl")}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6 pb-5 border-b border-slate-200/50">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200/50 group/icon relative">
             <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
             <Settings className="size-5 text-white relative z-10 animate-spin-slow" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="font-black text-lg lg:text-xl tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Control Panel Administation
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               <span className="text-[9px] text-indigo-500/80 uppercase tracking-[0.2em] font-black bg-white px-2.5 py-0.5 rounded-lg border border-indigo-100 shadow-sm">Privileged</span>
               <span className="text-[9px] text-violet-500/80 uppercase tracking-[0.2em] font-black bg-white px-2.5 py-0.5 rounded-lg border border-violet-100 shadow-sm">Secure</span>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-1 mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab('org')}
            className={cn("flex-1 text-[12px] font-bold py-2.5 rounded-lg transition-all", activeTab === 'org' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Định danh Cơ sở
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={cn("flex-1 text-[12px] font-bold py-2.5 rounded-lg transition-all", activeTab === 'system' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Luồng Truy cập
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn("flex-1 text-[12px] font-bold py-2.5 rounded-lg transition-all", activeTab === 'users' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Cấp Tài khoản
          </button>
        </div>

        {/* Tab 1: Org Specifics */}
        {activeTab === 'org' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl p-3 flex gap-3 relative overflow-hidden group/alert shadow-sm shadow-amber-500/5">
              <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
              <AlertCircle className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-relaxed font-bold">
                <strong className="text-amber-600 font-black uppercase tracking-wider block mb-0.5">Cảnh báo bảo mật:</strong>
                Các thay đổi sẽ tái thiết lập trạng thái định danh của <span className="text-amber-600 underline underline-offset-4">tất cả người dùng</span>.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-1.5 group/field">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 group-focus-within/field:text-indigo-600 transition-colors">
                  <div className="size-1.5 rounded-full bg-indigo-400" /> Đơn vị chuẩn
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

              <div className="space-y-1.5 group/field">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 group-focus-within/field:text-violet-600 transition-colors">
                   <div className="size-1.5 rounded-full bg-violet-400" /> Địa chỉ pháp lý
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

              <div className="space-y-1.5 group/field">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 group-focus-within/field:text-emerald-600 transition-colors">
                   <div className="size-1.5 rounded-full bg-emerald-400" /> Mã số thuế gốc
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

            <button
              onClick={handleSaveOrg}
              disabled={isSaving || !values.unit_name || !values.tax_code || !values.address}
              className="w-full group/btn relative rounded-xl px-6 py-3.5 bg-slate-900 text-white font-black text-[11px] transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-2 uppercase tracking-[0.3em] overflow-hidden shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isSaving ? <Loader2 className="size-4 animate-spin relative z-10" /> : <Save className="size-4 relative z-10 group-hover:scale-110 transition-transform" />}
              <span className="relative z-10">Cập nhật tham số hệ thống</span>
            </button>
          </div>
        )}

        {/* Tab 2: System Routing */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-fade-in border border-slate-200/80 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h4 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                  <Power className={cn("size-4", allowRegistration ? "text-emerald-500" : "text-rose-500")} /> 
                  Mở cổng đăng ký tài khoản tự do
                </h4>
                <p className="text-[12.5px] text-slate-500 leading-relaxed font-medium">
                  {allowRegistration 
                    ? "Hệ thống đang mở. Bất kỳ ai cũng có thể tự tạo tài khoản qua trang /register." 
                    : "Đã KHÓA cổng đăng ký. Người dùng mới sẽ thấy thông báo tạm đóng và không thể đăng ký."}
                </p>
              </div>
              
              <button 
                onClick={handleToggleRegistration}
                disabled={isSavingSystem}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none shrink-0 border-2",
                  allowRegistration ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-300 border-slate-300',
                  isSavingSystem && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm", allowRegistration ? 'translate-x-5' : 'translate-x-1')} />
              </button>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái Router</h5>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-mono font-semibold bg-slate-200 px-2 py-0.5 rounded text-slate-700">/register</span>
                    {allowRegistration ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">ACTIVE</span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">BLOCKED</span>
                    )}
                  </div>
               </div>
            </div>

          </div>
        )}

        {/* Tab 3: Create User Forcefully */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className={cn("grid gap-6 items-start", bulkResults.length > 0 && !isBulkCreating ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2")}>
            
              {/* SINGLE CREATION */}
              <form ref={formRef} className="space-y-6 border border-slate-200/80 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition relative" onSubmit={handleCreateUser}>
                {/* Divider for desktop */}
                <div className="hidden lg:block absolute -right-4 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
              
                <div className="mb-4">
                  <h4 className="text-[15px] font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <UserPlus className="size-4 text-blue-500" /> Tạo Đơn lẻ
                  </h4>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed font-medium">
                    Tạo một tài khoản trực tiếp qua Service Role, user có thể đăng nhập ngay.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={e => setNewUser(v => ({ ...v, email: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 text-[14px] font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        placeholder="user@vks.gov.vn"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mật khẩu khởi tạo</label>
                    <div className="relative group/pwd">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={newUser.password}
                        onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-slate-700 text-[14px] font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                        placeholder="Mật khẩu (trên 6 ký tự)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
                          const pwd = Array.from({length: 12}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                          setNewUser(v => ({ ...v, password: pwd }));
                        }}
                        title="Tạo mật khẩu ngẫu nhiên"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none rounded-lg transition-colors cursor-pointer"
                      >
                        <Wand2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                     <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Vai trò (Role)</label>
                     <div className="flex gap-3">
                       <button
                         type="button"
                         onClick={() => setNewUser(v => ({ ...v, role: 'user' }))}
                         className={cn("flex-1 px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-[14px] font-bold transition-all", newUser.role === 'user' ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100")}
                       >
                         Người dùng
                       </button>
                       <button
                         type="button"
                         onClick={() => setNewUser(v => ({ ...v, role: 'admin' }))}
                         className={cn("flex-1 px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-[14px] font-bold transition-all", newUser.role === 'admin' ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm" : "border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100")}
                       >
                         <ShieldCheck className="size-4" /> Quản trị viên
                       </button>
                     </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingUser || !newUser.email || !newUser.password}
                  className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 text-white font-bold text-[14px] rounded-xl py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  {isCreatingUser ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                  Khởi tạo
                </button>

                {singleCreateSuccess && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <p className="text-[12px] font-semibold text-emerald-700 truncate">
                      Đã tạo thành công <span className="font-mono font-bold">{singleCreateSuccess}</span>
                    </p>
                  </div>
                )}
              </form>

              {/* BULK CREATION */}
              <div className="space-y-6 border border-slate-200/80 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col overflow-hidden" style={formHeight ? { maxHeight: formHeight } : undefined}>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-800 flex items-center gap-2 mb-1">
                        <Database className="size-4 text-emerald-500" /> Tạo Hàng loạt
                      </h4>
                      <p className="text-[12.5px] text-slate-500 leading-relaxed font-medium">
                        Tùy chỉnh số lượng và tỷ lệ để tự động sinh hàng loạt.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid gap-4 place-content-start">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tổng Số lượng Mới</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={bulkTotal}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 100) setBulkTotal(val);
                          if (bulkAdminCount > val) setBulkAdminCount(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-[15px] font-bold outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-4 mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center justify-between">
                         <span className="text-[12px] font-bold text-rose-600 flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Admin: {bulkAdminCount}</span>
                         <span className="text-[12px] font-bold text-blue-600 flex items-center gap-1.5"><UserPlus className="size-3.5" /> User: {bulkTotal - bulkAdminCount}</span>
                      </div>
                    
                      <input 
                        type="range" 
                        min={0} 
                        max={bulkTotal || 1} 
                        value={bulkAdminCount} 
                        onChange={e => setBulkAdminCount(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                         <span>0</span>
                         <span>Tỉ lệ</span>
                         <span>{bulkTotal}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    {isBulkCreating && (
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                          <span>Tiến trình tạo</span>
                          <span>{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}></div>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500 text-center animate-pulse">
                          Đang xử lý {bulkProgress.current}/{bulkProgress.total}... Vui lòng không đóng trang.
                        </p>
                      </div>
                    )}
                  </div>

                  {!isBulkCreating && (
                    <button
                      onClick={handleBulkCreate}
                      disabled={bulkTotal <= 0}
                      className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 text-white font-bold text-[14px] rounded-xl py-3.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                    >
                      <Wand2 className="size-4" /> Tự động Khởi tạo
                    </button>
                  )}
              </div>

              {/* BULK RESULTS TABLE — third column */}
              {bulkResults.length > 0 && !isBulkCreating && (
                <div className="border border-slate-200/80 bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col" style={formHeight ? { maxHeight: formHeight } : undefined}>
                    {/* Header */}
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                          <ClipboardList className="size-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800">Danh sách tài khoản</h4>
                          <p className="text-[10px] text-slate-500 font-medium">{bulkResults.filter(r => r.status === 'Thành công').length}/{bulkResults.length} thành công</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={copyAllResults}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                            copiedAll
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200"
                          )}
                        >
                          {copiedAll ? <ClipboardCheck className="size-3" /> : <Copy className="size-3" />}
                          {copiedAll ? 'Đã copy!' : 'Copy all'}
                        </button>
                        <button
                          onClick={downloadBulkResults}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 transition-all"
                        >
                          <Download className="size-3" /> CSV
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-y-auto flex-1">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] w-8">#</th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Email</th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Mật khẩu</th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bulkResults.map((r, i) => (
                            <tr
                              key={i}
                              className={cn(
                                "group/row transition-colors",
                                copiedRow === i ? "bg-indigo-50/80" : "hover:bg-slate-50/80",
                                r.status !== 'Thành công' && "bg-rose-50/30"
                              )}
                            >
                              <td className="px-3 py-2 text-[10px] font-bold text-slate-400 tabular-nums">{i + 1}</td>
                              <td className="px-3 py-2">
                                <div className="text-[12px] font-semibold text-slate-700 font-mono">{r.email}</div>
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                                  r.role === 'admin'
                                    ? "bg-rose-100 text-rose-600"
                                    : "bg-blue-100 text-blue-600"
                                )}>
                                  {r.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-[11px] font-mono text-slate-600">{r.password}</td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => copyRow(i)}
                                  className={cn(
                                    "p-1 rounded-md transition-all",
                                    copiedRow === i
                                      ? "bg-emerald-100 text-emerald-600"
                                      : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover/row:opacity-100"
                                  )}
                                  title="Copy dòng này"
                                >
                                  {copiedRow === i ? <ClipboardCheck className="size-3" /> : <Copy className="size-3" />}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

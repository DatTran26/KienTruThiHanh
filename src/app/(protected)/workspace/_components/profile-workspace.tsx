'use client';

import { useState } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2, Circle,
  Landmark, Users, FileText, Settings, Key, Star,
  Briefcase, Camera, Wallet, Activity, Mail, MapPin, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { AdminOrgConfig } from './admin-org-config';

interface ProfileWorkspaceProps {
  profile: any;
  isVerified: boolean;
  userEmail: string;
  generalForm: React.ReactNode;
  isAdmin?: boolean;
}

const BASE_TABS = [
  { id: 'overview', label: 'Thông tin chung', icon: Building2 },
  { id: 'banking', label: 'Tài khoản ngân hàng', icon: Landmark },
  { id: 'structure', label: 'Cơ cấu tổ chức', icon: Users },
  { id: 'documents', label: 'Chứng từ pháp lý', icon: FileText },
  { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
];

export function ProfileWorkspace({ profile, isVerified, userEmail, generalForm, isAdmin }: ProfileWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const TABS = [
    ...BASE_TABS,
    ...(isAdmin ? [{ id: 'admin_config', label: '⚙️ Tham số Định danh', icon: Database }] : []),
  ];

  const steps = [
    { label: 'Xác thực Đơn vị', done: true },
    { label: 'Kiểm tra Mã số Thuế', done: isVerified },
    { label: 'Thiết lập Liên kết Thuế', done: false },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1200px] animate-fade-in-up flex flex-col w-full mx-auto pb-24 lg:pb-8">

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 ring-1 ring-slate-900/5 mb-8">
        {/* Abstract Background Top */}
        <div className="h-40 w-full relative overflow-hidden bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/2" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
          
          <button className="absolute top-4 right-4 bg-white/50 hover:bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[11px] font-bold text-slate-600 flex items-center gap-1.5 transition-colors">
            <Camera className="size-3.5" /> Thay đổi ảnh bìa
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
            <div className="size-28 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 relative group z-10 shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white relative overflow-hidden">
                <Building2 className="size-10" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer">
                  <Camera className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 size-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-[3px] border-white" title="Đã định danh hợp lệ">
                  <ShieldCheck className="size-4" strokeWidth={2.5} />
                </div>
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  Tài khoản tổ chức
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Star className="size-3 text-amber-400 fill-amber-400" /> Premium
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {profile?.unit_name || 'Đơn vị chưa định danh'}
              </h1>
              <div className="flex flex-col gap-1 mt-2.5">
                <p className="text-[13px] font-medium text-slate-600 flex items-center gap-2">
                  <Briefcase className="size-3.5 text-slate-400" /> 
                  <strong className="text-slate-700">Mã số thuế:</strong> {profile?.tax_code || 'Chưa cập nhật'}
                </p>
                <p className="text-[13px] font-medium text-slate-600 flex items-center gap-2">
                  <MapPin className="size-3.5 text-slate-400" /> 
                  <strong className="text-slate-700">Địa chỉ:</strong> {profile?.address || 'Chưa cập nhật'}
                </p>
                <p className="text-[13px] font-medium text-slate-600 flex items-center gap-2">
                  <Mail className="size-3.5 text-slate-400" /> 
                  <strong className="text-slate-700">Tài khoản quản trị:</strong> {userEmail}
                </p>
              </div>
            </div>

            <div className="flex gap-3 shrink-0 pb-2">
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[12px] font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                 Cài đặt
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[12px] font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-colors">
                 Nâng cấp gói
               </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-slate-100 pb-0">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap",
                    active 
                      ? "border-indigo-600 text-indigo-600" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="w-full">
        {activeTab === 'overview' && (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Form Side */}
            <div className="flex-[2] bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Database size={16} className="text-indigo-500"/>
                  Dữ liệu tổ chức cơ sở
                </span>
              </div>
              <p className="text-[13px] text-slate-500 mb-6 font-medium leading-relaxed">
                Vui lòng cung cấp chính xác tên đơn vị, mã số thuế và địa chỉ đăng ký trên Giấy phép kinh doanh / Quyết định thành lập để hệ thống đồng bộ với CSDL Quốc Gia.
              </p>
              {generalForm}
            </div>

            {/* Sidebar Stats Side */}
            <div className="flex-1 space-y-6">
              {/* Validation Status */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-5">Tiến trình định danh</h3>
                <div className="flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex items-start gap-3.5 group">
                      <div className="mt-0.5 relative">
                         {step.done ? (
                           <CheckCircle2 size={18} className="text-emerald-500 drop-shadow-sm" />
                         ) : (
                           <div className="size-[18px] rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-50">
                             {i === 1 && !isVerified && <div className="size-2 bg-indigo-500 rounded-full animate-pulse" />}
                           </div>
                         )}
                         {i < steps.length - 1 && (
                           <div className={cn(
                             "absolute top-[22px] left-1/2 -ml-[1px] w-[2px] h-6 rounded-full transition-colors",
                             steps[i].done ? "bg-emerald-200" : "bg-slate-100"
                           )} />
                         )}
                      </div>
                      <div className={cn(
                        "text-[13px] transition-colors pt-0.5", 
                        step.done ? "font-bold text-slate-700" : "font-medium text-slate-400"
                      )}>
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex gap-3">
                  <ShieldCheck className="size-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-indigo-800 text-[12px] leading-relaxed font-medium">
                    <strong className="font-bold">Quyền lợi:</strong> Việc tra cứu chi phí trên AI chỉ được mở khóa toàn phần sau khi định danh hệ thống hoàn tất.
                  </p>
                </div>
              </div>
              
              {/* Extra Widget */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[30px] translate-x-1/3 -translate-y-1/3 group-hover:bg-white/10 transition-all duration-700" />
                 <Key className="size-6 text-indigo-400 mb-4 drop-shadow-md" />
                 <h4 className="text-white font-bold text-[15px] mb-2">Quản lý Access Token</h4>
                 <p className="text-indigo-200/80 text-[12px] leading-relaxed mb-4">Mã API dùng để tích hợp hệ thống phần mềm kế toán (MISA, FAST) vào cổng nội bộ.</p>
                 <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md transition-colors w-full">
                   Tạo mã bảo mật
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Placeholders for other tabs */}
        {activeTab !== 'overview' && activeTab !== 'admin_config' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 flex flex-col items-center justify-center text-center min-h-[400px]">
             <div className="size-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner">
               {activeTab === 'banking' && <Landmark className="size-8 text-slate-300" />}
               {activeTab === 'structure' && <Users className="size-8 text-slate-300" />}
               {activeTab === 'documents' && <FileText className="size-8 text-slate-300" />}
               {activeTab === 'settings' && <Settings className="size-8 text-slate-300" />}
             </div>
             <h2 className="text-xl font-black text-slate-800 mb-2">Chức năng đang phát triển</h2>
             <p className="text-[13.5px] text-slate-500 max-w-[400px] leading-relaxed">
               Phân hệ <strong className="text-slate-700">{TABS.find(t => t.id === activeTab)?.label}</strong> đang được hoàn thiện và sẽ ra mắt trong bản cập nhật KienTruThiHanh v2.1.
             </p>
             <button onClick={() => setActiveTab('overview')} className="mt-6 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
               Quay lại Tổng quan
             </button>
          </div>
        )}

        {/* Admin Tools */}
        {activeTab === 'admin_config' && (
           <AdminOrgConfig />
        )}

      </div>
    </div>
  );
}

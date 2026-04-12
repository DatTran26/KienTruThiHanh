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
];

export function ProfileWorkspace({ profile, isVerified, userEmail, generalForm, isAdmin }: ProfileWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const TABS = [
    ...BASE_TABS,
    ...(isAdmin ? [{ id: 'admin_config', label: 'Tham số Định danh', icon: Database }] : []),
  ];

  const steps = [
    { label: 'Xác thực Đơn vị', done: true },
    { label: 'Kiểm tra Mã số Thuế', done: isVerified },
    { label: 'Thiết lập Liên kết Thuế', done: false },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1200px] animate-fade-in flex flex-col w-full mx-auto pb-24 lg:pb-8">

      {/* Hero Banner Section */}
      <div className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-200/60 ring-1 ring-slate-900/5 mb-6 animate-fade-in group/hero">
        {/* Abstract Background Top - Premium Aurora Style */}
        <div className="h-40 lg:h-48 w-full relative overflow-hidden bg-slate-900">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[70px] -translate-y-1/2" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05] mix-blend-overlay" />

          {/* Decorative lines */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <button className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/20 shadow-lg text-[10px] font-black text-white flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group/btn">
            <Camera className="size-3.5 text-indigo-300 group-hover/btn:rotate-12 transition-transform" />
            <span>Thay đổi ảnh bìa</span>
          </button>
        </div>

        {/* Profile Info Overlay - Glassmorphism Body */}
        <div className="px-6 lg:px-8 pb-6 lg:pb-8 relative">
          <div className="flex flex-col lg:flex-row gap-6 items-start mb-6">
            {/* Logo Container - Pull up ONLY the avatar */}
            <div className="relative z-10 shrink-0 lg:-mt-16 -mt-12">
              <div className="size-24 lg:size-28 rounded-3xl bg-white p-2.5 shadow-[0_15px_30px_rgba(0,0,0,0.12)] ring-1 ring-slate-200 relative group/avatar">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center text-white relative overflow-hidden shadow-inner">
                  <Building2 className="size-10 lg:size-12 drop-shadow-xl" strokeWidth={1.2} />
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover/avatar:bg-indigo-500/20 transition-all duration-500 flex items-center justify-center cursor-pointer">
                    <Camera className="size-8 text-white opacity-0 group-hover/avatar:opacity-100 scale-90 group-hover/avatar:scale-100 transition-all duration-300" />
                  </div>
                </div>
                {isVerified && (
                  <div className="absolute bottom-0 right-0 size-8 lg:size-10 bg-emerald-500 text-white rounded-[0.8rem] flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)] border-4 border-white transition-transform group-hover/avatar:scale-110" title="Đã định danh hợp lệ">
                    <ShieldCheck className="size-4 lg:size-5" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 pt-3">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[9px] lg:text-[10px] font-black text-indigo-700 uppercase tracking-widest bg-indigo-100/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-indigo-200/50 shadow-sm">
                  Cổng dữ liệu nội bộ
                </span>
                {isVerified ? (
                  <span className="text-[9px] lg:text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-200/50 shadow-sm flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đã định danh
                  </span>
                ) : (
                  <span className="text-[9px] lg:text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-100/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-200/50 shadow-sm flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-amber-500" />
                    Chờ định danh
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl  lg:text-3xl font-black tracking-tight text-slate-900 leading-[1.2] mb-5">
                {profile?.unit_name || 'Đơn vị chưa định danh'}
              </h1>

              {/* Enhanced Info Cards */}
              <div className="flex flex-wrap items-stretch gap-3 w-full">
                {/* Tax Code Card */}
                <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white/50 border border-emerald-100/60 shadow-[0_4px_15px_rgba(16,185,129,0.03)] flex items-center gap-3 hover:shadow-emerald-500/10 transition-all duration-300 group/item whitespace-nowrap">
                  <div className="size-10 shrink-0 rounded-xl bg-white shadow-sm border border-emerald-100/50 flex items-center justify-center text-emerald-500 group-hover/item:text-emerald-600 transition-colors">
                    <Briefcase className="size-4.5" />
                  </div>
                  <div className="overflow-hidden pr-2">
                    <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-[0.2em] mb-0.5">Mã số thuế</p>
                    <p className="text-sm font-black text-slate-800 tracking-widest">{profile?.tax_code || '---'}</p>
                  </div>
                </div>

                {/* Address Card */}
                <div className="flex-1 min-w-[280px] px-4 py-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white/50 border border-indigo-100/60 shadow-[0_4px_15px_rgba(99,102,241,0.03)] flex items-center gap-3 hover:shadow-indigo-500/10 transition-all duration-300 group/item">
                  <div className="size-10 shrink-0 rounded-xl bg-white shadow-sm border border-indigo-100/50 flex items-center justify-center text-indigo-500 group-hover/item:text-indigo-600 transition-colors">
                    <MapPin className="size-4.5" />
                  </div>
                  <div className="overflow-hidden min-w-0 w-full mb-[-2px]">
                    <p className="text-[9px] font-black text-indigo-600/70 uppercase tracking-[0.2em] mb-0.5">Địa chỉ trụ sở</p>
                    <p className="text-xs lg:text-[13px] font-bold text-slate-700 tracking-tight leading-tight line-clamp-2" title={profile?.address || ''}>{profile?.address || '---'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-100/80 pt-2">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-4 text-[13px] font-black transition-all relative group/tab whitespace-nowrap",
                    active ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon className={cn("size-4.5 transition-transform group-hover/tab:scale-110", active && "text-indigo-500 drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]")} />
                  {tab.label}
                  {active && (
                    <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-[0_-4px_10px_rgba(79,70,229,0.4)]" />
                  )}
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
            <div className="flex-[2] bg-white rounded-[2.5rem] border border-slate-200/80 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Database size={16} className="text-indigo-500" />
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
              <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-5">Tiến trình định danh</h3>
                <div className="flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex items-start gap-4 group/step">
                      <div className="mt-0.5 relative">
                        {step.done ? (
                          <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="size-5 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-50">
                            {i === 1 && !isVerified && <div className="size-2 bg-indigo-500 rounded-full animate-pulse" />}
                          </div>
                        )}
                        {i < steps.length - 1 && (
                          <div className={cn(
                            "absolute top-5 left-1/2 -ml-[1px] w-[2px] h-6 rounded-full transition-colors",
                            steps[i].done ? "bg-emerald-500" : "bg-slate-100"
                          )} />
                        )}
                      </div>
                      <div className={cn(
                        "text-[13px] transition-colors pt-0.5",
                        step.done ? "font-bold text-slate-800" : "font-medium text-slate-400"
                      )}>
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex gap-3 relative overflow-hidden group/benefit">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <ShieldCheck className="size-5 text-indigo-500 shrink-0 mt-0.5 animate-bounce-slow" />
                  <p className="text-indigo-900 text-[12px] leading-relaxed font-semibold">
                    <strong className="font-black text-indigo-600">Quyền lợi:</strong> Mở khóa full tính năng tra cứu AI sau khi hoàn tất định danh.
                  </p>
                </div>
              </div>

              {/* Extra Widget */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group/token hover:-translate-y-1 transition-all duration-500">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] group-hover/token:bg-indigo-500/30 transition-all duration-700" />
                <Key className="size-7 text-indigo-400 mb-5 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                <h4 className="text-white font-black text-[16px] mb-2 tracking-tight">Access Token</h4>
                <p className="text-indigo-200/60 text-[12px] leading-relaxed mb-5 font-medium">Tích hợp AI vào phần mềm kế toán MISA, FAST thông qua API Gateway.</p>
                <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest backdrop-blur-xl transition-all w-full shadow-lg">
                  Tạo mã bảo mật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Placeholders for other tabs */}
        {activeTab !== 'overview' && activeTab !== 'admin_config' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5 flex flex-col items-center justify-center text-center min-h-[450px]">
            <div className="size-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 shadow-inner relative group/icon">
              <div className="absolute inset-0 bg-indigo-500/0 group-hover/icon:bg-indigo-500/5 rounded-[2rem] transition-all" />
              {activeTab === 'banking' && <Landmark className="size-10 text-slate-300 group-hover/icon:text-indigo-400 transition-colors" />}
              {activeTab === 'structure' && <Users className="size-10 text-slate-300 group-hover/icon:text-indigo-400 transition-colors" />}
              {activeTab === 'documents' && <FileText className="size-10 text-slate-300 group-hover/icon:text-indigo-400 transition-colors" />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Chức năng đang phát triển</h2>
            <p className="text-[14px] text-slate-500 max-w-[400px] leading-relaxed font-medium">
              Phân hệ <strong className="text-indigo-600 font-black">{TABS.find(t => t.id === activeTab)?.label}</strong> đang được hoàn thiện kỹ thuật và sẽ ra mắt trong bản cập nhật kế tiếp.
            </p>
            <button onClick={() => setActiveTab('overview')} className="mt-8 text-[12px] font-black text-white bg-slate-900 hover:bg-indigo-600 rounded-xl px-6 py-2.5 transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 uppercase tracking-widest">
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

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Building2,
  Database,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';

const mainNavItems = [
  { href: '/analyze',     label: 'Phân loại AI',  icon: Sparkles,        desc: 'Định danh chi phí' },
  { href: '/dashboard',   label: 'Tổng quan',      icon: LayoutDashboard, desc: 'Thống kê hệ thống' },
  { href: '/reports',     label: 'Báo cáo',        icon: FileText,        desc: 'Quản lý hồ sơ' },
  { href: '/profile',     label: 'Hồ sơ Tổ chức', icon: Building2,       desc: 'Thông tin đơn vị' },
  { href: '/master-data', label: 'Kho Dữ liệu',   icon: Database,        desc: 'Dữ liệu chuẩn' },
];

const mobileNavItems = [
  { href: '/analyze',     label: 'Phân loại', icon: Sparkles },
  { href: '/dashboard',   label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/master-data', label: 'Kho dữ liệu', icon: Database },
  { href: '/reports',     label: 'Báo cáo',   icon: FileText },
  { href: '/profile',     label: 'Hồ sơ',     icon: Building2 },
];

interface SidebarProps {
  userEmail?: string;
  isAdmin?: boolean;
}

export function Sidebar({ userEmail, isAdmin = false }: SidebarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/analyze'
      ? pathname === '/analyze' || pathname === '/workspace'
      : pathname.startsWith(href);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Đã đăng xuất.');
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP SIDEBAR — fixed 256px (w-64), full height
          ════════════════════════════════════════ */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#14182B] border-r border-slate-800/60 flex-col shadow-2xl">
        {/* ── Logo Area ── */}
        <div className="flex items-center gap-3.5 px-6 py-6 border-b border-[#1E2442]/60 bg-[#14182B]">
          <div
            className="size-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.4)] bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-400/20"
          >
            <Zap className="size-5 text-white fill-transparent" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[#F59E0B] font-black text-[22px] tracking-tight leading-none mb-1.5" style={{ color: '#F59E0B' }}>VKS</h1>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-slate-400 truncate">
              Cổng Dữ Liệu Nội Bộ
            </p>
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-none">

          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-4 text-slate-500">
              Công cụ
            </p>

            <div className="space-y-1">
              {mainNavItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className={cn(
                      'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative',
                      active
                        ? 'bg-amber-500/15 text-amber-500 shadow-sm ring-1 ring-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2442]',
                    )}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.5 : 2}
                      className={active ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-400 transition-colors'}
                    />
                    <span className={cn("text-[14px] tracking-wide", active ? "font-bold" : "font-medium")}>
                      {label}
                    </span>
                    {active && (
                      <ChevronRight size={14} className="ml-auto text-amber-500/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* ── User + Logout ── */}
        <div className="p-4 border-t border-[#1E2442]/60 bg-[#14182B]">
          {userEmail && (
            <div className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#1E2442]/50 transition-colors cursor-pointer mb-2 group border border-transparent hover:border-slate-700/50">
              <div
                className="size-10 rounded-full flex items-center justify-center shrink-0 text-[14px] font-bold text-slate-900 bg-slate-100 shadow-inner"
              >
                {userEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-100 truncate shadow-sm">
                  Admin
                </p>
                <p className="text-[11.5px] font-medium text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                  {userEmail}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-start pl-3 gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
          >
            <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-black/40 border border-white/5">
              <span className="text-[11px] font-bold text-slate-400">N</span>
            </div>
            <LogOut size={16} strokeWidth={2.5} className="ml-1" />
            <span className="text-[13.5px] font-bold tracking-wide">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MOBILE BOTTOM NAV
          ════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center h-16"
        style={{
          background: '#0d1b2a',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors duration-150',
                active ? 'text-blue-400' : 'text-white/35',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{label}</span>
              {active && (
                <span className="absolute bottom-0 h-[2px] w-8 rounded-full bg-blue-400 -mb-px" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

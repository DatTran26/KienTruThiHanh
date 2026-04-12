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
  { href: '/analyze',   label: 'Phân loại AI',  icon: Sparkles,        desc: 'Định danh chi phí' },
  { href: '/dashboard', label: 'Tổng quan',      icon: LayoutDashboard, desc: 'Thống kê hệ thống' },
  { href: '/reports',   label: 'Báo cáo',        icon: FileText,        desc: 'Quản lý hồ sơ' },
  { href: '/profile',   label: 'Hồ sơ Tổ chức', icon: Building2,       desc: 'Thông tin đơn vị' },
];

const adminNavItems = [
  { href: '/admin/upload-master', label: 'Kho Dữ liệu', icon: Database, desc: 'Dữ liệu chuẩn' },
];

// Mobile bottom nav — 4 primary items
const mobileNavItems = [
  { href: '/analyze',   label: 'Phân loại', icon: Sparkles },
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/reports',   label: 'Báo cáo',   icon: FileText },
  { href: '/profile',   label: 'Hồ sơ',     icon: Building2 },
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
          DESKTOP SIDEBAR — fixed 240px, full height
          ════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-60 flex-col"
        style={{
          background: '#0d1b2a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
          <div
            className="size-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
            }}
          >
            <Zap className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-[14px] tracking-tight leading-none">KienTru</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              Cổng Dữ Liệu Nội Bộ
            </p>
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">

          <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 mb-2"
            style={{ color: 'rgba(255,255,255,0.22)' }}>
            Ứng dụng
          </p>

          <div className="space-y-0.5">
            {mainNavItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group relative',
                    active
                      ? 'bg-white/[0.10] text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]',
                  )}
                >
                  {/* Active left accent bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-blue-400"
                      style={{ boxShadow: '0 0 8px rgba(96,165,250,0.7)' }}
                    />
                  )}
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.3 : 1.8}
                    className={active ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60 transition-colors'}
                  />
                  <span className="text-[13px] font-semibold tracking-tight">{label}</span>
                  {active && (
                    <ChevronRight size={12} className="ml-auto text-white/25" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin section — only for admins */}
          {isAdmin && (
            <>
              <div className="mt-5 mb-3 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

              <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 mb-2"
                style={{ color: 'rgba(255,255,255,0.22)' }}>
                Quản trị
              </p>

              <div className="space-y-0.5">
                {adminNavItems.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <button
                      key={href}
                      onClick={() => router.push(href)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group relative',
                        active
                          ? 'bg-white/[0.10] text-white'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]',
                      )}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-blue-400"
                          style={{ boxShadow: '0 0 8px rgba(96,165,250,0.7)' }}
                        />
                      )}
                      <Icon
                        size={16}
                        strokeWidth={active ? 2.3 : 1.8}
                        className={active ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60 transition-colors'}
                      />
                      <span className="text-[13px] font-semibold tracking-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* ── User + Logout ── */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          {/* User info */}
          {userEmail && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div
                className="size-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
              >
                {userEmail[0].toUpperCase()}
              </div>
              <p className="text-[11px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {userEmail}
              </p>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-white/35 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={15} strokeWidth={1.8} />
            <span className="text-[13px] font-semibold">Đăng xuất</span>
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

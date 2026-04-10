'use client';

import Link from 'next/link';
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
  LogOut 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',          label: 'Tổng quan',        icon: LayoutDashboard },
  { href: '/analyze',            label: 'Phân loại AI',     icon: Sparkles },
  { href: '/reports',            label: 'Báo cáo',          icon: FileText },
  { href: '/profile',            label: 'Hồ sơ Tổ chức',    icon: Building2 },
  { href: '/admin/upload-master',label: 'Kho Dữ liệu Mức',  icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Đã đăng xuất khỏi hệ thống.');
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="h-full flex-shrink-0 flex items-center transition-all z-50">
      
      <div className="w-[80px] h-full bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5 flex flex-col items-center py-6 relative z-50 isolate">
        
        {/* Brand Indicator */}
        <div className="mb-8 group relative cursor-pointer flex flex-col items-center">
          <div className="size-12 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1 group-active:scale-95">
             <div className="size-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
          </div>
          {/* Tooltip */}
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[11px] uppercase font-bold tracking-widest rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl z-50">
            HỆ THỐNG PHÂN TÍCH
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        </div>

        {/* Navigation Nodes */}
        <nav className="flex-1 w-full flex flex-col items-center justify-start gap-4">
          {navItems.map(({ href, label, icon: Icon }, index) => {
            const active = isActive(href);
            return (
              <div key={href} className="relative group w-full flex justify-center">
                <Link
                  href={href}
                  className={cn(
                    'size-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative z-10',
                    active 
                      ? 'bg-slate-900 text-white shadow-md scale-105' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-105'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon size={active ? 22 : 24} className={cn("transition-all duration-300", active && "scale-110")} />
                </Link>
                
                {/* Modern Tooltip */}
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[12px] font-bold tracking-wide rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-50">
                  {label}
                  <div className="absolute top-1/2 -left-[5px] -translate-y-1/2 w-2.5 h-2.5 bg-white border-l border-b border-slate-200 rotate-45" />
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="w-full flex justify-center mt-auto pt-6 relative group">
          
          <div className="absolute top-0 w-8 h-px bg-slate-200" />
          
          <button
            onClick={handleSignOut}
            className="size-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
          >
            <LogOut size={24} />
          </button>
          
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-600 text-white text-[12px] font-bold tracking-wide rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg shadow-red-600/20 z-50">
            Đăng xuất
            <div className="absolute top-1/2 -left-[5px] -translate-y-1/2 w-2.5 h-2.5 bg-red-600 rotate-45" />
          </div>
        </div>

      </div>
    </aside>
  );
}

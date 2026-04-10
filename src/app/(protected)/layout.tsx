import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from './_components/sidebar';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden relative selection:bg-accent selection:text-accent-foreground">
      
      {/* Clean Light Institutional Background Overlay */}
      <div className="absolute inset-0 bg-background z-0 pointer-events-none" />

      {/* Structure Grid (Subtle) */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      {/* Main Layout Container */}
      <div className="relative z-10 flex w-full h-full p-4 lg:p-6 gap-6">
        
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto rounded-xl bg-card border border-border shadow-sm pb-24 lg:pb-0 scroll-smooth">
          {children}
        </main>
        
      </div>
    </div>
  );
}

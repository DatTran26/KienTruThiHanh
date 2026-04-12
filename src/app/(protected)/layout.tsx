import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Sidebar } from './_components/sidebar';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Read role via service client (bypasses RLS — always accurate)
  const serviceSupabase = createServiceClient();
  const { data: userRow } = await serviceSupabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  const isAdmin = (userRow as any)?.role === 'admin';

  return (
    <div className="flex min-h-[100dvh] bg-[#f8fafc]">

      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <Sidebar userEmail={user.email} isAdmin={isAdmin} />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  );
}

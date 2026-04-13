import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Sidebar } from './_components/sidebar';
import { AiChatBubble } from './_components/ai-chat-bubble';

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

  let { data: profile } = await supabase
    .from('organization_profiles')
    .select('unit_name, address, tax_code')
    .eq('user_id', user.id)
    .maybeSingle();

  if (isAdmin && (!profile || !profile.unit_name)) {
    const { data: refData } = await serviceSupabase
      .from('org_reference')
      .select('unit_name, address, tax_code')
      .limit(1)
      .maybeSingle();
    if (refData) {
      profile = {
        unit_name: refData.unit_name,
        address: refData.address,
        tax_code: refData.tax_code,
      };
    }
  }
  const isProfileComplete = Boolean(profile?.unit_name && profile?.address && profile?.tax_code);

  return (
    <div className="flex min-h-[100dvh] bg-[#f8fafc]">

      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <Sidebar userEmail={user.email} isAdmin={isAdmin} isProfileComplete={isProfileComplete} />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

      </div>
      
      {/* ── Floating AI Chat ── */}
      <AiChatBubble />
    </div>
  );
}

import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import MasterDataClientPage from './client-page';

export default async function MasterDataPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const serviceSupabase = createServiceClient();
  const { data: userRow } = await serviceSupabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  const isAdmin = userRow?.role === 'admin';

  return <MasterDataClientPage isAdmin={isAdmin} />;
}

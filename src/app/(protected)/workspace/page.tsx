import { createClient, createServiceClient } from '@/lib/supabase/server';
import { OrgForm } from './_components/org-form';
import { ProfileWorkspace } from './_components/profile-workspace';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const serviceSupabase = createServiceClient();
  const { data: userRow } = await serviceSupabase
    .from('users')
    .select('role')
    .eq('id', user!.id)
    .single();
  const isAdmin = (userRow as any)?.role === 'admin';

  const { data: profile } = await supabase
    .from('organization_profiles')
    .select('unit_name, address, tax_code, validation_status')
    .eq('user_id', user!.id)
    .maybeSingle();

  const isVerified = profile?.validation_status === 'matched';

  return (
    <ProfileWorkspace 
      profile={profile} 
      isVerified={isVerified}
      userEmail={user?.email || ''}
      isAdmin={isAdmin}
      generalForm={<OrgForm initialValues={profile ?? undefined} isVerified={isVerified} />}
    />
  );
}

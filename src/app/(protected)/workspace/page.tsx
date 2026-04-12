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

  let { data: profile } = await supabase
    .from('organization_profiles')
    .select('unit_name, address, tax_code, validation_status')
    .eq('user_id', user!.id)
    .maybeSingle();

  // If Admin and no profile yet, or header is empty, pull from system reference
  if (isAdmin && (!profile || !profile.unit_name)) {
    const { data: refData } = await serviceSupabase
      .from('org_reference')
      .select('unit_name, address, tax_code')
      .limit(1)
      .maybeSingle();

    if (refData) {
      profile = {
        ...profile,
        unit_name: refData.unit_name,
        address: refData.address,
        tax_code: refData.tax_code,
        validation_status: 'matched' // Admin's config is by definition matched
      };
    }
  }

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

import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const supabase = await createClient();
  
  const { data: settings } = await supabase
    .from('system_settings')
    .select('allow_registration')
    .eq('id', 1)
    .single();

  const allowRegistration = (settings as any)?.allow_registration ?? true;

  return <LoginForm allowRegistration={allowRegistration} />;
}

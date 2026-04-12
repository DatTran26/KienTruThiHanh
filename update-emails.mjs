import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) return console.error('Error fetching users:', error);
  
  for (const user of users) {
     if (user.email === 'admin@hcm.gov.vn') {
       const res = await supabase.auth.admin.updateUserById(user.id, { email: 'admin@gov.vn', email_confirm: true });
       console.log('Updated admin:', res.error ? res.error.message : 'Success');
     }
     if (user.email === 'canbo@hcm.gov.vn') {
       const res = await supabase.auth.admin.updateUserById(user.id, { email: 'canbo@gov.vn', email_confirm: true });
       console.log('Updated canbo:', res.error ? res.error.message : 'Success');
     }
  }
}

main();

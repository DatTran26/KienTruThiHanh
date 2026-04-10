/**
 * seed-demo-data.ts
 * Seeds org_reference data for the demo.
 * Run: npx tsx scripts/seed-demo-data.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const ORG_REFERENCE = [
  {
    unit_name: 'Trường Đại học Kiến Trúc Hà Nội',
    address: '1 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    tax_code: '0100114734',
    normalized_name: 'truong dai hoc kien truc ha noi',
  },
  {
    unit_name: 'Học viện Công nghệ Bưu chính Viễn thông',
    address: 'Km10 Nguyễn Trãi, Hà Đông, Hà Nội',
    tax_code: '0100110360',
    normalized_name: 'hoc vien cong nghe buu chinh vien thong',
  },
  {
    unit_name: 'Trường Đại học Bách khoa Hà Nội',
    address: '1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
    tax_code: '0100104968',
    normalized_name: 'truong dai hoc bach khoa ha noi',
  },
  {
    unit_name: 'Trường Đại học Kinh tế Quốc dân',
    address: '207 Giải Phóng, Hai Bà Trưng, Hà Nội',
    tax_code: '0100111346',
    normalized_name: 'truong dai hoc kinh te quoc dan',
  },
  {
    unit_name: 'Viện Hàn lâm Khoa học và Công nghệ Việt Nam',
    address: '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    tax_code: '0100111579',
    normalized_name: 'vien han lam khoa hoc va cong nghe viet nam',
  },
  {
    unit_name: 'Viện kiểm sát nhân dân khu vực 5 – Đắk Lắk',
    address: 'Khu trung tâm hành chính, xã Dray Bhăng, tỉnh Đắk Lắk',
    tax_code: '6000930278',
    normalized_name: 'vien kiem sat nhan dan khu vuc 5 dak lak',
  },
];

async function seed() {
  console.log('Seeding org_reference...');

  const { error: deleteError } = await supabase.from('org_reference').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Failed to clear org_reference:', deleteError.message);
    process.exit(1);
  }

  const { data, error } = await supabase.from('org_reference').insert(ORG_REFERENCE).select('id, unit_name');
  if (error) {
    console.error('Failed to insert org_reference:', error.message);
    process.exit(1);
  }

  console.log(`Inserted ${data?.length ?? 0} org_reference records:`);
  data?.forEach(r => console.log(`  - ${r.unit_name}`));
  console.log('\nDone! Now upload the master Excel file via /admin/upload-master and publish it.');
}

seed();

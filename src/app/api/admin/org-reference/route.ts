import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateSchema = z.object({
  unit_name: z.string().min(5),
  address: z.string().min(5),
  tax_code: z.string().min(5),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceSupabase = createServiceClient();
    const { data: userRow } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if ((userRow as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await serviceSupabase
      .from('org_reference')
      .select('unit_name, address, tax_code')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return NextResponse.json(data || {});
  } catch (err: any) {
    console.error('[GET org-reference]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }
    const { unit_name, address, tax_code } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceSupabase = createServiceClient();
    const { data: userRow } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if ((userRow as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upsert the first row. We assume there's only one.
    // First, verify if a row exists so we can update it or insert a new one.
    const { data: existing } = await serviceSupabase
        .from('org_reference')
        .select('id')
        .limit(1)
        .single();
        
    let updateData = { unit_name, address, tax_code, normalized_name: unit_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') };

    let result;
    if (existing?.id) {
       result = await serviceSupabase
         .from('org_reference')
         .update(updateData)
         .eq('id', existing.id);
    } else {
       result = await serviceSupabase
         .from('org_reference')
         .insert([updateData]);
    }

    if (result.error) throw result.error;

    // Optional: After updating master data, we might invalidate all current user validation statuses 
    // so they are forced to revalidate. 
    await serviceSupabase
      .from('organization_profiles')
      .update({ validation_status: 'no_match' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[POST org-reference]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

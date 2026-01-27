import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServerClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { tenant_id, user_name, user_email, user_password } =
    await request.json();

  if (!tenant_id || !user_name || !user_email || !user_password) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Verify tenant exists
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', tenant_id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Create auth user using service role
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: user_email,
      password: user_password,
      email_confirm: true,
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Create profile (customer role, with tenant)
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    tenant_id: tenant_id,
    role: 'customer',
    full_name: user_name,
    email: user_email,
  });

  if (profileError) {
    // Try to clean up auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user_id: authData.user.id,
  });
}

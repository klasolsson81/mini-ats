import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify admin auth
    const supabase = await createServerClient();
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

    // Parse request body
    const body = await request.json();
    const { user_name, user_email, user_password } = body;

    if (!user_name || !user_email || !user_password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: user_email,
        password: user_password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: 'Failed to create user: ' + authError.message },
        { status: 500 }
      );
    }

    // 2. Create profile (admin, no tenant)
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      tenant_id: null,
      role: 'admin',
      full_name: user_name,
      email: user_email,
      must_change_password: true,
    });

    if (profileError) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create profile: ' + profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

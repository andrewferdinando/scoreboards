import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is super admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }
    
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      );
    }
    
    // Create brand using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('brands')
      .insert([{ name: name.trim() }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating brand:', error);
      return NextResponse.json(
        { error: 'Failed to create brand' },
        { status: 500 }
      );
    }
    
    // Add the super admin as owner of the new brand
    await supabaseAdmin
      .from('brand_memberships')
      .insert([{
        brand_id: data.id,
        user_id: user.id,
        role: 'owner',
      }]);
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/brands:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


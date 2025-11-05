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
    
    const { email, brand_id, role } = await request.json();
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }
    
    if (!brand_id || typeof brand_id !== 'string') {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }
    
    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role (admin or member) is required' },
        { status: 400 }
      );
    }
    
    // Check if brand exists
    const { data: brand, error: brandError } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('id', brand_id)
      .single();
    
    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }
    
    // Check if user exists in auth.users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to check user existence' },
        { status: 500 }
      );
    }
    
    const existingUser = users.users.find(u => u.email === email.toLowerCase());
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found. Please ensure the user has signed up first.' },
        { status: 404 }
      );
    }
    
    // Ensure profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', existingUser.id)
      .single();
    
    if (!existingProfile) {
      // Create profile
      await supabaseAdmin
        .from('profiles')
        .insert([{
          id: existingUser.id,
          email: existingUser.email || email,
          name: existingUser.user_metadata?.name || email.split('@')[0],
        }]);
    }
    
    // Check if membership already exists
    const { data: existingMembership } = await supabaseAdmin
      .from('brand_memberships')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('user_id', existingUser.id)
      .single();
    
    if (existingMembership) {
      // Update existing membership
      const { error: updateError } = await supabaseAdmin
        .from('brand_memberships')
        .update({ role })
        .eq('brand_id', brand_id)
        .eq('user_id', existingUser.id);
      
      if (updateError) {
        console.error('Error updating membership:', updateError);
        return NextResponse.json(
          { error: 'Failed to update membership' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { message: 'Membership updated successfully' },
        { status: 200 }
      );
    }
    
    // Create new membership
    const { error: membershipError } = await supabaseAdmin
      .from('brand_memberships')
      .insert([{
        brand_id,
        user_id: existingUser.id,
        role,
      }]);
    
    if (membershipError) {
      console.error('Error creating membership:', membershipError);
      return NextResponse.json(
        { error: 'Failed to create membership' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'User invited successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


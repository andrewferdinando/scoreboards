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
    
    // Check if user already exists
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to check user existence' },
        { status: 500 }
      );
    }
    
    const users = usersData?.users || [];
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    let userId: string;
    
    if (existingUser) {
      // User exists - use their ID
      userId = existingUser.id;
      
      // Ensure profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (!existingProfile) {
        // Create profile
        await supabaseAdmin
          .from('profiles')
          .insert([{
            id: userId,
            email: existingUser.email || email,
            name: existingUser.user_metadata?.name || email.split('@')[0],
          }]);
      }
    } else {
      // User doesn't exist - invite them using Supabase Auth invite
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email.toLowerCase(),
        {
          data: {
            brand_id: brand_id,
            role: role,
            invited_by: user.id,
          },
        }
      );
      
      if (inviteError) {
        console.error('Error inviting user:', inviteError);
        return NextResponse.json(
          { error: inviteError.message || 'Failed to send invitation email' },
          { status: 500 }
        );
      }
      
      if (!inviteData?.user) {
        return NextResponse.json(
          { error: 'Failed to create invitation' },
          { status: 500 }
        );
      }
      
      userId = inviteData.user.id;
      
      // Create profile for invited user (upsert to handle race conditions)
      await supabaseAdmin
        .from('profiles')
        .upsert([{
          id: userId,
          email: email.toLowerCase(),
          name: email.split('@')[0],
        }], {
          onConflict: 'id',
          ignoreDuplicates: false
        });
    }
    
    // Check if membership already exists
    const { data: existingMembership } = await supabaseAdmin
      .from('brand_memberships')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('user_id', userId)
      .single();
    
    if (existingMembership) {
      // Update existing membership
      const { error: updateError } = await supabaseAdmin
        .from('brand_memberships')
        .update({ role })
        .eq('brand_id', brand_id)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating membership:', updateError);
        return NextResponse.json(
          { error: 'Failed to update membership' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { message: existingUser ? 'Membership updated successfully' : 'Invitation sent and membership created' },
        { status: 200 }
      );
    }
    
    // Create new membership
    const { error: membershipError } = await supabaseAdmin
      .from('brand_memberships')
      .insert([{
        brand_id,
        user_id: userId,
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
      { message: existingUser ? 'Membership created successfully' : 'Invitation sent successfully' },
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


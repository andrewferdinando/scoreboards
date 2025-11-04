import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand_id, name, data_source } = body;

    if (!brand_id || !name) {
      return NextResponse.json(
        { error: 'brand_id and name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('metrics')
      .insert({
        brand_id,
        name: name.trim(),
        data_source: data_source?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating metric:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create metric' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



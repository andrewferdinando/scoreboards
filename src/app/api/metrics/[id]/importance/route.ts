import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const metricId = params.id;
    const body = await request.json();
    const { importance } = body;

    if (!importance || !['green', 'amber', 'red'].includes(importance)) {
      return NextResponse.json(
        { error: 'importance must be one of: green, amber, red' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('metrics')
      .update({ importance })
      .eq('id', metricId)
      .select()
      .single();

    if (error) {
      console.error('Error updating metric importance:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update metric importance' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/metrics/[id]/importance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


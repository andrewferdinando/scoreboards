import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric_id, year, month, value } = body;

    if (!metric_id || !year || !month || value === undefined) {
      return NextResponse.json(
        { error: 'metric_id, year, month, and value are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('metric_values')
      .upsert({
        metric_id,
        year,
        month,
        value: Number(value),
      }, {
        onConflict: 'metric_id,year,month',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating metric value:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create metric value' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/metric-values:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric_id = searchParams.get('metric_id');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!metric_id || !year || !month) {
      return NextResponse.json(
        { error: 'metric_id, year, and month are required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('metric_values')
      .delete()
      .eq('metric_id', metric_id)
      .eq('year', parseInt(year))
      .eq('month', parseInt(month));

    if (error) {
      console.error('Error deleting metric value:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete metric value' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/metric-values:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}





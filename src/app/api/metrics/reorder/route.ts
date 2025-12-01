import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand_id, ordered_metric_ids } = body;

    if (!brand_id || !Array.isArray(ordered_metric_ids)) {
      return NextResponse.json(
        { error: 'brand_id and ordered_metric_ids array are required' },
        { status: 400 }
      );
    }

    // Validate that all metrics belong to the brand
    const { data: existingMetrics, error: fetchError } = await supabaseAdmin
      .from('metrics')
      .select('id, brand_id')
      .in('id', ordered_metric_ids);

    if (fetchError) {
      console.error('Error validating metrics:', fetchError);
      return NextResponse.json(
        { error: 'Failed to validate metrics' },
        { status: 500 }
      );
    }

    // Check that all metrics belong to the brand
    const invalidMetrics = existingMetrics?.filter(m => m.brand_id !== brand_id);
    if (invalidMetrics && invalidMetrics.length > 0) {
      return NextResponse.json(
        { error: 'Some metrics do not belong to the specified brand' },
        { status: 403 }
      );
    }

    // Update sort_order for each metric (1, 2, 3, ...)
    const updates = ordered_metric_ids.map((id: string, index: number) => ({
      id,
      sort_order: index + 1,
    }));

    // Use upsert to update multiple rows
    const { error } = await supabaseAdmin
      .from('metrics')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Error updating metric order:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update metric order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/metrics/reorder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


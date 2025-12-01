import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const metricId = params.id;

    if (!metricId) {
      return NextResponse.json(
        { error: 'metric_id is required' },
        { status: 400 }
      );
    }

    // The foreign key on metric_values already has ON DELETE CASCADE,
    // so deleting the metric will automatically delete all associated metric_values
    const { error } = await supabaseAdmin
      .from('metrics')
      .delete()
      .eq('id', metricId);

    if (error) {
      console.error('Error deleting metric:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete metric' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/metrics/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


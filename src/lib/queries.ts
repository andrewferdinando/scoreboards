import { supabase, supabaseAdmin } from './supabase';
import type { Brand, Metric, MetricValue } from '../types/database';

// Get all brands for the current user
// Using admin client for now since we don't have auth set up yet
export async function getUserBrands() {
  // RLS will automatically filter brands based on membership
  // For now, using admin client to bypass RLS until auth is set up
  const { data, error } = await supabaseAdmin
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return data as Brand[];
}

// Get all metrics for a brand
export async function getBrandMetrics(brandId: string) {
  // Using admin client to bypass RLS until auth is set up
  const { data, error } = await supabaseAdmin
    .from('metrics')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching metrics:', error);
    return [];
  }

  return data as Metric[];
}

// Get a single metric with its values
export async function getMetric(metricId: string) {
  // Using admin client to bypass RLS until auth is set up
  const { data: metric, error: metricError } = await supabaseAdmin
    .from('metrics')
    .select('*')
    .eq('id', metricId)
    .single();

  if (metricError || !metric) {
    console.error('Error fetching metric:', metricError);
    return null;
  }

  // Using admin client to bypass RLS until auth is set up
  const { data: values, error: valuesError } = await supabaseAdmin
    .from('metric_values')
    .select('*')
    .eq('metric_id', metricId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (valuesError) {
    console.error('Error fetching metric values:', valuesError);
  }

  return {
    ...metric,
    values: (values || []) as MetricValue[],
  };
}

// Get latest value for each metric in a brand
export async function getBrandMetricsWithLatestValues(brandId: string) {
  const metrics = await getBrandMetrics(brandId);
  
  const metricsWithValues = await Promise.all(
    metrics.map(async (metric) => {
      // Using admin client to bypass RLS until auth is set up
      const { data: latestValue } = await supabaseAdmin
        .from('metric_values')
        .select('value, year, month')
        .eq('metric_id', metric.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1)
        .single();

      return {
        ...metric,
        latestValue: latestValue?.value || null,
        latestYear: latestValue?.year || null,
        latestMonth: latestValue?.month || null,
      };
    })
  );

  return metricsWithValues;
}

// Get all metric values for a specific year, organized by metric_id -> year -> month
export async function getAllMetricValuesForYear(year: number) {
  // Using admin client to bypass RLS until auth is set up
  const { data, error } = await supabaseAdmin
    .from('metric_values')
    .select('metric_id, year, month, value')
    .eq('year', year)
    .order('metric_id')
    .order('month');

  if (error) {
    console.error('Error fetching metric values:', error);
    return {};
  }

  // Organize as: metric_id -> year -> month -> value
  const organized: Record<string, Record<number, Record<number, number>>> = {};
  
  (data || []).forEach((item) => {
    if (!organized[item.metric_id]) {
      organized[item.metric_id] = {};
    }
    if (!organized[item.metric_id][item.year]) {
      organized[item.metric_id][item.year] = {};
    }
    organized[item.metric_id][item.year][item.month] = Number(item.value);
  });

  return organized;
}


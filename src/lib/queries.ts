import { supabase } from './supabase';
import type { Brand, Metric, MetricValue, BrandMembership } from '../types/database';

// Get all brands for the current user
export async function getUserBrands() {
  // RLS will automatically filter brands based on membership
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data: metric, error: metricError } = await supabase
    .from('metrics')
    .select('*')
    .eq('id', metricId)
    .single();

  if (metricError || !metric) {
    console.error('Error fetching metric:', metricError);
    return null;
  }

  const { data: values, error: valuesError } = await supabase
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
      const { data: latestValue } = await supabase
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


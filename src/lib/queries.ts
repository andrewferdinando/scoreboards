import { createClient } from './auth';
import type { Brand, Metric, MetricValue } from '../types/database';
import type { Profile } from '../types/database';

// Get all brands for the current user
// RLS will automatically filter brands based on membership
export async function getUserBrands() {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  
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

// Get all metric values for a specific year, organized by metric_id -> year -> month
export async function getAllMetricValuesForYear(year: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
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

// Get all metric values for years 2023-2025 (or current year if > 2025)
// Organized as: metric_id -> year -> month -> value
export async function getAllMetricValuesForYears() {
  const currentYear = new Date().getFullYear();
  const startYear = 2023;
  const endYear = Math.max(currentYear, 2025); // At least up to 2025
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('metric_values')
    .select('metric_id, year, month, value')
    .gte('year', startYear)
    .lte('year', endYear)
    .order('metric_id')
    .order('year')
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

// Get current user's profile
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data as Profile;
}

// Check if current user is a super admin
export async function isSuperAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.is_super_admin === true;
}


// Database types matching the correct Supabase schema

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string; // matches auth.users.id
  email: string;
  name?: string;
  is_super_admin?: boolean;
  created_at: string;
}

export interface BrandMembership {
  brand_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
}

export type Importance = 'green' | 'amber' | 'red';

export interface Metric {
  id: string;
  brand_id: string;
  name: string;
  data_source: string | null;
  importance: Importance | null;
  created_at: string;
}

export interface MetricValue {
  id: string;
  metric_id: string;
  year: number;
  month: number; // 1-12
  value: number;
}

export interface UserBrandAccess {
  brand_id: string;
  user_id: string;
}

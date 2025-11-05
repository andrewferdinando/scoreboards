-- Fix infinite recursion in RLS policies
-- The issue: Policies check if user is super admin by querying profiles table,
-- but profiles table has RLS that checks super admin status, causing recursion

-- Create a security definer function to check super admin status
-- This bypasses RLS for the check itself
CREATE OR REPLACE FUNCTION is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = user_id),
    false
  );
$$;

-- Drop the problematic profile policy that causes recursion
DROP POLICY IF EXISTS "super admins can read all profiles" ON profiles;

-- Recreate profile policies with the function
-- Users can always read their own profile (this already exists)
-- Super admins can read all profiles using the function
CREATE POLICY "super admins can read all profiles" ON profiles
  FOR SELECT
  USING (
    id = auth.uid()  -- Users can read their own profile
    OR
    is_super_admin(auth.uid())  -- Super admins can read all profiles
  );

-- Update brands policy to use the function
DROP POLICY IF EXISTS "brand accessible to members or super admins" ON brands;
CREATE POLICY "brand accessible to members or super admins" ON brands FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_memberships bm
      WHERE bm.brand_id = brands.id AND bm.user_id = auth.uid()
    )
    OR
    is_super_admin(auth.uid())
  );

-- Update metrics policies to use the function
DROP POLICY IF EXISTS "metrics by membership or super admin" ON metrics;
CREATE POLICY "metrics by membership or super admin" ON metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_memberships bm
      WHERE bm.brand_id = metrics.brand_id AND bm.user_id = auth.uid()
    )
    OR
    is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "insert metrics by members or super admin" ON metrics;
CREATE POLICY "insert metrics by members or super admin" ON metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_memberships bm
      WHERE bm.brand_id = metrics.brand_id AND bm.user_id = auth.uid()
    )
    OR
    is_super_admin(auth.uid())
  );

-- Update metric_values policies to use the function
DROP POLICY IF EXISTS "values by membership or super admin" ON metric_values;
CREATE POLICY "values by membership or super admin" ON metric_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM metrics m
      JOIN brand_memberships bm ON bm.brand_id = m.brand_id
      WHERE m.id = metric_values.metric_id AND bm.user_id = auth.uid()
    )
    OR
    is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "insert values by members or super admin" ON metric_values;
CREATE POLICY "insert values by members or super admin" ON metric_values FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM metrics m
      JOIN brand_memberships bm ON bm.brand_id = m.brand_id
      WHERE m.id = metric_values.metric_id AND bm.user_id = auth.uid()
    )
    OR
    is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "update values by members or super admin" ON metric_values;
CREATE POLICY "update values by members or super admin" ON metric_values FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM metrics m
      JOIN brand_memberships bm ON bm.brand_id = m.brand_id
      WHERE m.id = metric_values.metric_id AND bm.user_id = auth.uid()
    )
    OR
    is_super_admin(auth.uid())
  );



-- Fix RLS policies to allow super admins to access all brands and metrics
-- The issue is that existing policies only check for brand_memberships, 
-- but super admins should have access even without memberships

-- Drop and recreate the brands SELECT policy to include super admins
DROP POLICY IF EXISTS "brand accessible to members" ON brands;
CREATE POLICY "brand accessible to members or super admins" ON brands FOR SELECT
  USING (
    -- Either user has a brand membership OR user is a super admin
    EXISTS (
      SELECT 1 FROM brand_memberships bm
      WHERE bm.brand_id = brands.id AND bm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Drop and recreate the metrics SELECT policy to include super admins
DROP POLICY IF EXISTS "metrics by membership" ON metrics;
CREATE POLICY "metrics by membership or super admin" ON metrics FOR SELECT
  USING (
    -- Either user has a brand membership for the metric's brand OR user is a super admin
    EXISTS (
      SELECT 1 FROM brand_memberships bm
      WHERE bm.brand_id = metrics.brand_id AND bm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Drop and recreate the metrics INSERT policy to include super admins
DROP POLICY IF EXISTS "insert metrics by members" ON metrics;
CREATE POLICY "insert metrics by members or super admin" ON metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_memberships bm
      WHERE bm.brand_id = metrics.brand_id AND bm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Drop and recreate the metric_values SELECT policy to include super admins
DROP POLICY IF EXISTS "values by membership" ON metric_values;
CREATE POLICY "values by membership or super admin" ON metric_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM metrics m
      JOIN brand_memberships bm ON bm.brand_id = m.brand_id
      WHERE m.id = metric_values.metric_id AND bm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Drop and recreate the metric_values INSERT policy to include super admins
DROP POLICY IF EXISTS "insert/update values by members" ON metric_values;
CREATE POLICY "insert values by members or super admin" ON metric_values FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM metrics m
      JOIN brand_memberships bm ON bm.brand_id = m.brand_id
      WHERE m.id = metric_values.metric_id AND bm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Drop and recreate the metric_values UPDATE policy to include super admins
DROP POLICY IF EXISTS "update values by members" ON metric_values;
CREATE POLICY "update values by members or super admin" ON metric_values FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM metrics m
      JOIN brand_memberships bm ON bm.brand_id = m.brand_id
      WHERE m.id = metric_values.metric_id AND bm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );



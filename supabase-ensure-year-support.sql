-- Ensure metric_values.year column supports future years (2026+)
-- This migration is defensive - the year column already has no constraints,
-- but we'll add a reasonable range constraint to prevent invalid years

-- Check if there's an existing constraint on year
-- If not, add a reasonable range constraint (2020-2100)
-- This ensures we support 2026 and beyond without needing code changes

DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'metric_values_year_range_check'
  ) THEN
    -- Add a reasonable range constraint
    ALTER TABLE public.metric_values
    ADD CONSTRAINT metric_values_year_range_check
    CHECK (year BETWEEN 2020 AND 2100);
  END IF;
END $$;


-- Add importance column to metrics table
-- This column stores a traffic-light indicator (green, amber, red) for metric priority

alter table public.metrics
add column if not exists importance text check (importance in ('green','amber','red')) default 'green';

-- Set default value for any existing rows that might be null
update public.metrics
set importance = 'green'
where importance is null;

-- Verify the foreign key on metric_values already has ON DELETE CASCADE
-- (It should already be set based on the schema, but we'll verify)
-- The existing schema has: metric_id uuid not null references metrics(id) on delete cascade
-- So we don't need to modify it


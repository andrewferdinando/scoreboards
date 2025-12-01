-- Add sort_order column to metrics table for drag-and-drop reordering

alter table public.metrics
add column if not exists sort_order integer;

-- Backfill sort_order so each metric has a value, ordered per brand
-- Uses created_at and id as tiebreaker for consistent ordering
update public.metrics m
set sort_order = sub.rn
from (
  select id,
         row_number() over (partition by brand_id order by created_at, id) as rn
  from public.metrics
) as sub
where sub.id = m.id
and m.sort_order is null;

-- Create index to help with ordering queries
create index if not exists idx_metrics_brand_sort_order 
on public.metrics(brand_id, sort_order);


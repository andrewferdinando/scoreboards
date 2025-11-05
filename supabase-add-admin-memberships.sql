-- First, let's see your profile ID and the brands
-- Replace 'your-email@example.com' with your actual email address
SELECT 'Your Profile:' as info, id, email, name FROM public.profiles WHERE email = 'your-email@example.com';

SELECT 'Available Brands:' as info, id, name FROM public.brands ORDER BY created_at;

-- Add yourself as admin to all brands
-- Replace 'your-email@example.com' with your actual email address
INSERT INTO public.brand_memberships (brand_id, user_id, role)
SELECT 
  b.id as brand_id,
  p.id as user_id,
  'admin' as role
FROM public.brands b
CROSS JOIN public.profiles p
WHERE p.email = 'your-email@example.com'
ON CONFLICT (brand_id, user_id) 
DO UPDATE SET role = 'admin';

-- Verify the memberships were created
SELECT 
  bm.brand_id,
  b.name as brand_name,
  p.email as user_email,
  p.name as user_name,
  bm.role
FROM public.brand_memberships bm
JOIN public.brands b ON bm.brand_id = b.id
JOIN public.profiles p ON bm.user_id = p.id
WHERE p.email = 'your-email@example.com';



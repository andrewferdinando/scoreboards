-- Check which users don't have profiles yet
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'name' as name_from_metadata,
  p.id as profile_exists
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Create profiles for all users that don't have one yet
INSERT INTO public.profiles (id, email, name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;



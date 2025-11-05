-- Add super_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Make andrew@adhoc.help a super admin
UPDATE profiles
SET is_super_admin = TRUE
WHERE email = 'andrew@adhoc.help';

-- If the user doesn't have a profile yet, create one and make them super admin
INSERT INTO profiles (id, email, name, is_super_admin)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  TRUE
FROM auth.users au
WHERE au.email = 'andrew@adhoc.help'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE;

-- Add RLS policy to allow super admins to read all profiles
CREATE POLICY IF NOT EXISTS "super admins can read all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Add RLS policy to allow super admins to read all brands
CREATE POLICY IF NOT EXISTS "super admins can read all brands" ON brands
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Add RLS policy to allow super admins to insert brands
CREATE POLICY IF NOT EXISTS "super admins can insert brands" ON brands
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Add RLS policy to allow super admins to read all brand memberships
CREATE POLICY IF NOT EXISTS "super admins can read all brand memberships" ON brand_memberships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );

-- Add RLS policy to allow super admins to insert brand memberships
CREATE POLICY IF NOT EXISTS "super admins can insert brand memberships" ON brand_memberships
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = TRUE
    )
  );



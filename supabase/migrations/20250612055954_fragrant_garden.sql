/*
  # Assign Admin Role to Existing User

  1. Problem
    - User exists in auth.users but doesn't have admin role in user_roles table
    - This causes authentication to work but admin access to fail

  2. Solution
    - Insert admin role for the existing admin user
    - Handle case where user might already have the role
*/

-- Insert admin role for the existing admin user
-- This will work if the user exists in auth.users
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@myresumepath.com' 
  LIMIT 1;

  -- If admin user exists, ensure they have admin role
  IF admin_user_id IS NOT NULL THEN
    -- First, deactivate any existing admin roles for this user
    UPDATE user_roles 
    SET is_active = false, updated_at = now()
    WHERE user_id = admin_user_id AND role = 'admin';
    
    -- Insert new active admin role
    INSERT INTO user_roles (user_id, role, granted_by, is_active, created_at)
    VALUES (admin_user_id, 'admin', admin_user_id, true, now())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user not found. Please create user with email: admin@myresumepath.com';
  END IF;
END $$;
/*
  # Create Admin User Setup

  1. Purpose
    - Provides instructions and setup for creating the admin test account
    - Creates a function to help with user role assignment after manual user creation
    
  2. Manual Steps Required
    - Admin user must be created manually in Supabase Dashboard
    - This migration provides the supporting database structure
    
  3. Security
    - Ensures proper role assignment for admin users
*/

-- Function to assign admin role to a user (to be called after manual user creation)
CREATE OR REPLACE FUNCTION assign_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role, granted_by, is_active)
  VALUES (target_user_id, 'admin', target_user_id, true)
  ON CONFLICT (user_id, role) WHERE is_active = true
  DO NOTHING;
  
  RAISE NOTICE 'Admin role assigned to user %', user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION assign_admin_role(text) TO authenticated;

-- Create a view to check if admin user exists (for debugging)
CREATE OR REPLACE VIEW admin_user_check AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role,
  ur.is_active as role_active
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.role = 'admin' AND ur.is_active = true
WHERE u.email = 'admin@myresumepath.com';

-- Grant select permission on the view
GRANT SELECT ON admin_user_check TO authenticated;
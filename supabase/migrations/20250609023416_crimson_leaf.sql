/*
  # Add User Roles and Admin Access Control

  1. New Tables
    - `user_roles` - Store user role assignments
    - Add role column to existing users via auth metadata

  2. Security
    - Enable RLS on user_roles table
    - Add policies for role management
    - Create admin role validation functions

  3. Admin Features
    - System validation access
    - User management capabilities
    - Advanced reporting features
*/

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'user', 'moderator')),
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_active ON user_roles(user_id, role) WHERE is_active = true;

-- RLS Policies
CREATE POLICY "Users can read own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'admin' 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid uuid DEFAULT auth.uid())
RETURNS text[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ARRAY_AGG(role) 
  FROM user_roles 
  WHERE user_id = user_uuid 
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
$$;

-- Create function to grant admin role (can only be called by existing admin or during setup)
CREATE OR REPLACE FUNCTION grant_admin_role(target_user_id uuid, granted_by_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_granter_admin boolean;
  admin_count integer;
BEGIN
  -- Check if there are any admins in the system
  SELECT COUNT(*) INTO admin_count 
  FROM user_roles 
  WHERE role = 'admin' AND is_active = true;
  
  -- If no admins exist, allow the first admin to be created
  IF admin_count = 0 THEN
    INSERT INTO user_roles (user_id, role, granted_by, is_active)
    VALUES (target_user_id, 'admin', granted_by_user_id, true);
    RETURN true;
  END IF;
  
  -- Check if the granter is an admin
  SELECT is_admin(granted_by_user_id) INTO is_granter_admin;
  
  IF NOT is_granter_admin THEN
    RAISE EXCEPTION 'Only admins can grant admin roles';
  END IF;
  
  -- Deactivate any existing admin role for this user
  UPDATE user_roles 
  SET is_active = false, updated_at = now()
  WHERE user_id = target_user_id AND role = 'admin';
  
  -- Grant new admin role
  INSERT INTO user_roles (user_id, role, granted_by, is_active)
  VALUES (target_user_id, 'admin', granted_by_user_id, true);
  
  RETURN true;
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON user_roles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial admin user (replace with actual admin email)
-- This should be run manually with the correct admin email
-- INSERT INTO user_roles (user_id, role, is_active) 
-- SELECT id, 'admin', true 
-- FROM auth.users 
-- WHERE email = 'admin@myresumepath.com'
-- ON CONFLICT (user_id, role) WHERE is_active = true DO NOTHING;
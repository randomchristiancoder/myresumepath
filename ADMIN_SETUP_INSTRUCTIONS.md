# Admin Account Setup Instructions

## IMPORTANT: Manual Steps Required

The admin test account must be created manually in your Supabase project. Follow these steps:

### Step 1: Create Admin User in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** or **"Invite user"**
4. Enter the following details:
   - **Email:** `admin@myresumepath.com`
   - **Password:** `AdminPass123!`
   - **Email Confirm:** Set to `true` (confirmed)
5. Click **"Create user"** or **"Send invitation"**

### Step 2: Assign Admin Role (After User Creation)

After creating the user, run this SQL query in your Supabase SQL Editor:

```sql
SELECT assign_admin_role('admin@myresumepath.com');
```

### Step 3: Verify Setup

Run this query to verify the admin user was created correctly:

```sql
SELECT * FROM admin_user_check;
```

You should see:
- User email: admin@myresumepath.com
- Role: admin
- Role active: true

## Why Manual Creation is Required

Supabase Auth users cannot be created directly through SQL migrations for security reasons. The authentication system requires users to be created through:
- Supabase Dashboard (manual)
- Supabase Auth API (programmatic)
- User registration flow (self-service)

## Alternative: Use Your Own Account

Instead of creating the test admin account, you can:

1. Sign up with your own email through the application
2. Manually assign yourself admin role:
   ```sql
   SELECT assign_admin_role('your-email@example.com');
   ```

## Troubleshooting

### Error: "Invalid login credentials"
- Verify the user exists in Supabase Dashboard → Authentication → Users
- Check that the email and password match exactly
- Ensure the user's email is confirmed

### Error: "User not found" when assigning role
- The user must exist in auth.users first
- Double-check the email address spelling

### Error: "Access denied"
- Ensure RLS policies are properly configured
- Check that the user has the correct role assigned

## Security Notes

- This is a development/testing account only
- In production, use strong unique passwords
- Enable MFA for admin accounts
- Regularly rotate credentials
- Monitor access logs

## Next Steps

After completing the setup:
1. Test login with admin credentials
2. Verify admin dashboard access
3. Test all admin features
4. Create sample data if needed
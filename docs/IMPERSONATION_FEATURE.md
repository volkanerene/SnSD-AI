# User Impersonation Feature

## Overview

The user impersonation feature allows SNSD Admin users (role_id <= 1) to securely log into the application as any other user. This is useful for:

- Testing user experiences and permissions
- Troubleshooting user-specific issues
- Verifying user-reported bugs
- Demonstrating features from a specific user's perspective

## Security Features

1. **Permission-Based Access**: Only users with role_id <= 1 (SNSD Admin) can initiate impersonation
2. **Token-Based Sessions**: Each impersonation creates a unique, time-limited token
3. **30-Minute Expiration**: Impersonation sessions automatically expire after 30 minutes
4. **Single-Use Tokens**: Each token can only be used once
5. **Audit Trail**: All impersonation sessions are logged in the database with:
   - Admin user who initiated the impersonation
   - Target user being impersonated
   - Timestamp of creation and usage
   - Expiration time
6. **Visual Indicator**: Orange banner clearly shows when in impersonation mode

## How to Use

### Starting Impersonation

1. Navigate to **Dashboard > Administration > Users**
2. Find the user you want to impersonate
3. Click the actions menu (⋮) for that user
4. Select **"Login as User"** from the dropdown
5. Confirm the action in the dialog
6. A new browser tab will open with you logged in as that user

### During Impersonation

- An orange banner will appear at the top of the screen showing:
  - "Impersonation Mode Active"
  - The name of the user you're impersonating
  - "Exit Impersonation" button
- Your session will last for 30 minutes
- You will see the application exactly as the impersonated user sees it

### Exiting Impersonation

**Option 1: Use the Exit Button**
- Click the **"Exit Impersonation"** button in the orange banner
- You will be signed out and redirected to the admin users page

**Option 2: Close the Tab**
- Simply close the browser tab
- The impersonation session will remain active until expiration (30 min)

**Option 3: Wait for Expiration**
- Sessions automatically expire after 30 minutes
- You'll be signed out when the session expires

## Database Schema

### Table: `impersonation_sessions`

```sql
CREATE TABLE public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Setup Instructions

### 1. Run Database Migration

Execute the SQL migration file to create the required table:

```bash
# Connect to your Supabase database and run:
psql -h <your-supabase-host> -U postgres -d postgres -f scripts/create_impersonation_sessions_table.sql
```

Or run it directly in the Supabase SQL Editor:
1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `scripts/create_impersonation_sessions_table.sql`
3. Paste and execute

### 2. Configure Environment Variables

Ensure your `.env.production` or `.env.local` has the service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**IMPORTANT**: Never expose the service role key to the client. It should only be used in server-side API routes.

### 3. Verify Permissions

Ensure your admin user has `role_id <= 1` in the profiles table.

## API Endpoints

### GET `/api/admin/impersonate?userId={uuid}`
Initiates an impersonation session.

**Query Parameters:**
- `userId` (required): UUID of the user to impersonate

**Response:**
- Redirects to activation endpoint with token

**Errors:**
- 400: User ID missing
- 401: Not authenticated
- 403: Insufficient permissions (not admin)
- 404: Target user not found
- 500: Failed to create session

### GET `/api/admin/impersonate/activate?token={uuid}`
Activates an impersonation session using a token.

**Query Parameters:**
- `token` (required): Unique impersonation token

**Response:**
- Redirects to dashboard with session cookies set

**Errors:**
- Redirects to `/dashboard?error=...` with error codes:
  - `invalid_impersonation_token`
  - `invalid_impersonation_session`
  - `impersonation_session_expired`
  - `target_user_not_found`
  - `failed_to_impersonate`

### POST `/api/admin/impersonate/exit`
Exits the current impersonation session.

**Response:**
```json
{
  "success": true,
  "message": "Impersonation session ended"
}
```

## Components

### `<ImpersonationBanner />`
Client component that displays the orange banner when impersonation is active.

**Location:** `src/components/impersonation-banner.tsx`

**Features:**
- Automatically detects impersonation via cookie
- Displays impersonated user's name
- Provides exit button
- Updates every second to check cookie status

## Cookies

| Cookie Name | Type | Purpose | Lifetime |
|------------|------|---------|----------|
| `impersonation` | String ("true") | Indicates active impersonation | 30 min |
| `impersonated_user_name` | String (URL encoded) | Stores target user's name | 30 min |
| `sb-access-token` | String (JWT) | Supabase session token | 30 min |
| `sb-refresh-token` | String (JWT) | Supabase refresh token | 30 min |

## Best Practices

1. **Always inform users**: If debugging a user's account, let them know beforehand
2. **Time-limited sessions**: Keep impersonation sessions as short as possible
3. **Document usage**: Keep internal logs of why impersonation was used
4. **Review audit logs**: Regularly check `impersonation_sessions` table for unusual activity
5. **Clean up expired sessions**: Consider a cron job to delete old sessions:

```sql
DELETE FROM impersonation_sessions
WHERE expires_at < NOW() - INTERVAL '7 days';
```

## Troubleshooting

### Issue: "Unauthorized: Admin access required"
**Solution**: Verify that your user has `role_id <= 1` in the profiles table.

### Issue: "Failed to create impersonation session"
**Solution**: Check that the `impersonation_sessions` table exists and the migration was run successfully.

### Issue: "Failed to impersonate" error
**Solution**:
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check Supabase logs for auth errors
- Ensure target user's email exists in profiles table

### Issue: Banner doesn't appear
**Solution**:
- Check browser console for errors
- Verify cookies are being set (DevTools > Application > Cookies)
- Clear browser cache and try again

### Issue: Session expires too quickly
**Solution**: The 30-minute limit is by design. To extend:
- Edit `maxAge: 60 * 30` in both route files
- Update expiration calculation: `Date.now() + 30 * 60 * 1000`

## Security Considerations

⚠️ **WARNING**: This feature provides full access to user accounts. Only grant admin permissions to trusted individuals.

- Impersonation bypasses normal authentication
- Actions performed during impersonation appear as the target user
- Consider implementing additional logging for actions taken during impersonation
- Regular security audits of the `impersonation_sessions` table are recommended

## Future Enhancements

Potential improvements for this feature:

1. **Activity Logging**: Track all actions performed during impersonation
2. **Notifications**: Notify users when their account is accessed via impersonation
3. **Extended Audit Trail**: Log specific actions (page views, data changes) during impersonation
4. **Admin Dashboard**: Create a dedicated page to view all impersonation sessions
5. **Reasons/Comments**: Require admins to provide a reason before impersonating
6. **Two-Factor Authentication**: Require 2FA for impersonation initiation

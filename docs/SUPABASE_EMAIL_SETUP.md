# 📧 Supabase Email Configuration Fix

## Problem
Email confirmation links are redirecting to Clerk's domain instead of your application.

## Solution
You need to update your Supabase project settings to use the correct redirect URLs.

---

## Step-by-Step Instructions

### 1. Go to Supabase Dashboard

1. Open your browser and go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **ojkqgvkzumbnmasmajkw**

### 2. Navigate to Authentication Settings

1. In the left sidebar, click **Authentication**
2. Click on **URL Configuration**

### 3. Update URL Settings

Configure the following URLs:

#### Site URL
```
https://snsdconsultant.com
```
*For local development, you can temporarily change this to `http://localhost:3000`*

#### Redirect URLs
Add these URLs (click **Add URL** for each one):

**Production:**
```
https://snsdconsultant.com/**
https://snsdconsultant.com/auth/callback
```

**Development (optional, for local testing):**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

### 4. Update Email Templates

1. In the left sidebar under **Authentication**, click **Email Templates**
2. Select **Confirm signup** template
3. Look for the confirmation link in the template
4. Make sure it uses: `{{ .ConfirmationURL }}`
5. The template should look something like this:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

### 5. Remove Old Clerk URLs (If Present)

1. Go to **URL Configuration** again
2. Look through all redirect URLs
3. Remove any URLs containing `accounts.dev` or `clerk.com`

### 6. Save Changes

1. Click **Save** at the bottom of the page
2. Wait a few seconds for changes to propagate

---

## Testing the Fix

### 1. Clear Browser Cache
- Clear your browser cookies and cache
- Or use an incognito/private window

### 2. Try Sign Up Again
1. Go to `http://localhost:3000/auth/sign-up`
2. Fill in your details with a NEW email address
3. Click **Sign Up**

### 3. Check Your Email
1. Check the email you used for sign-up
2. You should receive a confirmation email from Supabase
3. The link should now point to: `http://localhost:3000/auth/callback?code=...`

### 4. Click the Confirmation Link
1. Click the link in the email
2. You should be redirected to your dashboard
3. You should be signed in automatically

---

## What We Fixed in the Code

### 1. Updated `useAuth.ts` Hook
Added `emailRedirectTo` option to the sign-up function:
```typescript
options: {
  data: credentials.metadata,
  emailRedirectTo: `${window.location.origin}/auth/callback`
}
```

### 2. Created Auth Callback Route
Created `/src/app/auth/callback/route.ts` to handle email confirmation:
- Exchanges the email code for a session
- Redirects user to the dashboard
- Handles errors gracefully

---

## Additional Configuration (Optional)

### Enable Email Confirmation
If you want to require email confirmation before users can sign in:

1. Go to **Authentication** > **Providers**
2. Click on **Email**
3. Enable **Confirm email**
4. Click **Save**

### Customize Email Templates
You can customize the email templates:

1. Go to **Authentication** > **Email Templates**
2. Edit templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

---

## Troubleshooting

### Still seeing Clerk URLs?
1. Make sure you saved all changes in Supabase dashboard
2. Clear your browser cache completely
3. Try a different browser or incognito mode
4. Check if there are any environment variables pointing to Clerk

### Email not arriving?
1. Check your spam/junk folder
2. Verify the email address is correct
3. Check Supabase logs: **Authentication** > **Logs**
4. Make sure email sending is not rate-limited

### Callback route not working?
1. Make sure the file exists at `/src/app/auth/callback/route.ts`
2. Restart your development server: `pnpm dev`
3. Check the browser console for errors
4. Verify the `@supabase/ssr` package is installed: `pnpm list @supabase/ssr`

---

## Production Deployment

When deploying to production:

### 1. Update Environment Variables
Add these to your production environment:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ojkqgvkzumbnmasmajkw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Update Supabase URLs
In Supabase dashboard:
1. Change **Site URL** to your production domain
2. Add production redirect URLs:
   ```
   https://yourdomain.com/**
   https://yourdomain.com/auth/callback
   ```

### 3. Update Email Templates (if customized)
Make sure any hardcoded URLs in email templates use `{{ .SiteURL }}` variable instead.

---

## Summary

✅ **Code Changes Made:**
- Updated `useAuth.ts` to include `emailRedirectTo`
- Created `/auth/callback` route for email verification

🔧 **What You Need to Do:**
1. Update Supabase dashboard URL configuration
2. Add redirect URLs for your domain
3. Remove any old Clerk URLs
4. Test with a new email address

⏱️ **Time Required:** 5-10 minutes

---

## Need Help?

If you're still having issues:
1. Check the Supabase dashboard logs
2. Check browser console for errors
3. Verify all URLs are correct (no typos)
4. Make sure you're using a fresh email address for testing

---

*Last Updated: 2025-10-15*
*Integration completed with Claude Code*

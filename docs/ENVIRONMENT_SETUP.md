# Environment Setup Guide

This guide explains how to set up environment variables for the SnSD AI application across different environments (local, development, and production).

## Table of Contents

- [Overview](#overview)
- [Environment Files](#environment-files)
- [Required Secrets](#required-secrets)
- [Local Development Setup](#local-development-setup)
- [AWS Amplify Configuration](#aws-amplify-configuration)
- [Environment Variables Reference](#environment-variables-reference)
- [Security Best Practices](#security-best-practices)

---

## Overview

The application uses different environment configurations based on deployment:

| Environment | API URL | Purpose |
|------------|---------|---------|
| **Local** | `http://localhost:8000` | Local development |
| **Development** | `http://localhost:8000` | AWS Amplify dev branch |
| **Production** | `https://api.snsdconsultant.com` | AWS Amplify main branch |

---

## Environment Files

The project includes the following environment files:

```
.env.local          # Local development (gitignored)
.env.development    # Development deployment settings
.env.production     # Production deployment settings
.env.example        # Template file (commit this)
```

**Important:**
- ✅ Commit: `.env.example`, `.env.development`, `.env.production`
- ❌ Never commit: `.env.local`

---

## Required Secrets

Before starting, you need to obtain or generate the following secrets:

### 1. Supabase Service Role Key

This is a sensitive key that should NEVER be exposed to the client.

**Where to find it:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `ojkqgvkzumbnmasmajkw`
3. Go to Settings → API
4. Copy the `service_role` key (not the `anon` key)

### 2. Supabase JWT Secret

**Where to find it:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the `JWT Secret`

### 3. NextAuth Secret

Generate a secure random string:

```bash
openssl rand -base64 32
```

### 4. Sentry Credentials (Optional)

If you want error tracking:

1. Create account at [sentry.io](https://sentry.io)
2. Create a new project
3. Get your DSN, Organization, and Project names
4. Generate an auth token for source map uploads

---

## Local Development Setup

### Step 1: Copy Template File

```bash
cp .env.example .env.local
```

### Step 2: Fill in Required Values

Open `.env.local` and replace the following:

```bash
# Required
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
SUPABASE_JWT_SECRET=your-actual-jwt-secret
NEXTAUTH_SECRET=your-generated-nextauth-secret

# Optional (for Sentry)
NEXT_PUBLIC_SENTRY_DISABLED=true  # Set to false to enable
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_ORG=your-org
NEXT_PUBLIC_SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-sentry-token

# Optional (for Google Analytics)
NEXT_PUBLIC_GA_ID=your-ga-id
```

### Step 3: Verify Configuration

The Supabase anon key is already configured and safe to use in client-side code:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qa3Fndmt6dW1ibm1hc21hamt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjM2MDUsImV4cCI6MjA3NDg5OTYwNX0.nRWXZjkJjZgfDi87uksrElnDZmLK6Diueh7u3jPfAXA
```

### Step 4: Run the Application

```bash
pnpm install
pnpm dev
```

Your app should now be running at `http://localhost:3000`

---

## AWS Amplify Configuration

### Setting Up Environment Variables in Amplify

1. **Go to AWS Amplify Console**
   - Navigate to your app
   - Select the branch (main or dev)
   - Go to "Environment variables"

2. **Add Required Variables**

For **Production** (main branch):

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://snsdconsultant.com
NEXT_PUBLIC_API_URL=https://api.snsdconsultant.com

# Supabase (Secrets)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>

# Auth (Secret)
NEXTAUTH_URL=https://snsdconsultant.com
NEXTAUTH_SECRET=<your-nextauth-secret>

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DISABLED=false
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
NEXT_PUBLIC_SENTRY_ORG=<your-org>
NEXT_PUBLIC_SENTRY_PROJECT=<your-project>
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_AUTH_TOKEN=<your-token>

# Analytics (Optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GA_ID=<your-ga-id>

# Feature Flags
NEXT_PUBLIC_ENABLE_EVREN_GPT=true
NEXT_PUBLIC_ENABLE_MARCEL_GPT=true
NEXT_PUBLIC_ENABLE_SAFETY_BUD=true

# Public variables (no secrets)
NEXT_PUBLIC_SUPABASE_URL=https://ojkqgvkzumbnmasmajkw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qa3Fndmt6dW1ibm1hc21hamt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjM2MDUsImV4cCI6MjA3NDg5OTYwNX0.nRWXZjkJjZgfDi87uksrElnDZmLK6Diueh7u3jPfAXA
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=error
```

For **Development** (dev branch):

Same as production but with these changes:

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=https://dev.snsdconsultant.com
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=https://dev.snsdconsultant.com
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=info
```

3. **Mark Sensitive Variables as Secrets**

In Amplify, mark these as **secret** (they will be encrypted):
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `NEXTAUTH_SECRET`
- `SENTRY_AUTH_TOKEN`

### Deployment

The `amplify.yml` is already configured to automatically inject environment variables during build:

```yaml
build:
  commands:
    - env | grep -e NEXTAUTH_ >> .env.production || true
    - env | grep -e NEXT_PUBLIC_ >> .env.production || true
    - env | grep -e SUPABASE_ >> .env.production || true
    - env | grep -e SENTRY_ >> .env.production || true
    - pnpm run build
```

---

## Environment Variables Reference

### Application Configuration

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development`, `production` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | Yes | `https://snsdconsultant.com` |
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Yes | `https://api.snsdconsultant.com` |

### Supabase Configuration

| Variable | Description | Required | Client/Server | Secret |
|----------|-------------|----------|---------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | Client | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Yes | Client | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes | Server | **YES** |
| `SUPABASE_JWT_SECRET` | JWT verification secret | Yes | Server | **YES** |

### Authentication

| Variable | Description | Required | Secret |
|----------|-------------|----------|--------|
| `NEXTAUTH_URL` | Auth callback URL | Yes | No |
| `NEXTAUTH_SECRET` | Session encryption key | Yes | **YES** |
| `NEXT_PUBLIC_SESSION_TIMEOUT` | Session duration (seconds) | No | No |

### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_EVREN_GPT` | Enable Evren GPT module | `true` |
| `NEXT_PUBLIC_ENABLE_MARCEL_GPT` | Enable Marcel GPT module | `true` |
| `NEXT_PUBLIC_ENABLE_SAFETY_BUD` | Enable Safety Bud module | `true` |

### Error Tracking (Sentry)

| Variable | Description | Secret |
|----------|-------------|--------|
| `NEXT_PUBLIC_SENTRY_DISABLED` | Disable Sentry | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project DSN | No |
| `NEXT_PUBLIC_SENTRY_ORG` | Sentry organization | No |
| `NEXT_PUBLIC_SENTRY_PROJECT` | Sentry project name | No |
| `SENTRY_AUTH_TOKEN` | Source map upload token | **YES** |

### File Upload

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | Allowed file extensions | `pdf,doc,docx,xls,xlsx,png,jpg,jpeg` |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Storage bucket name | `snsd-documents` |

### Localization

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language | `en` |
| `NEXT_PUBLIC_SUPPORTED_LOCALES` | Available languages | `en,tr` |
| `NEXT_PUBLIC_DEFAULT_TIMEZONE` | Default timezone | `Asia/Dubai` |

---

## Security Best Practices

### ✅ DO

1. **Use environment variables for all sensitive data**
   - API keys
   - Secrets
   - Database credentials

2. **Never commit `.env.local`**
   - Add it to `.gitignore`
   - Use `.env.example` as a template

3. **Use different secrets per environment**
   - Different `NEXTAUTH_SECRET` for dev and prod
   - Rotate secrets periodically

4. **Mark secrets in Amplify**
   - Use Amplify's secret encryption
   - Restrict access to production secrets

5. **Validate environment variables at runtime**
   - Check for required variables on app start
   - Fail fast if critical variables are missing

### ❌ DON'T

1. **Never expose server-only variables to the client**
   - Don't prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`
   - Keep JWT secrets server-side only

2. **Don't hardcode secrets in code**
   ```javascript
   // ❌ BAD
   const apiKey = "sk_live_abc123"

   // ✅ GOOD
   const apiKey = process.env.API_KEY
   ```

3. **Don't log sensitive values**
   ```javascript
   // ❌ BAD
   console.log('Secret:', process.env.SUPABASE_SERVICE_ROLE_KEY)

   // ✅ GOOD
   console.log('Supabase configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
   ```

4. **Don't use production secrets in development**
   - Keep environments isolated
   - Use test/sandbox accounts for dev

---

## Troubleshooting

### Build Fails in Amplify

**Check:**
1. All required environment variables are set in Amplify Console
2. Variable names match exactly (case-sensitive)
3. No extra spaces in variable values
4. Secrets are marked correctly

### Authentication Not Working

**Check:**
1. `NEXTAUTH_URL` matches your actual URL
2. `NEXTAUTH_SECRET` is set and secure (32+ characters)
3. Supabase keys are correct
4. JWT secret matches Supabase project

### API Calls Failing

**Check:**
1. `NEXT_PUBLIC_API_URL` points to correct backend
2. Backend is running and accessible
3. CORS is configured correctly on backend
4. Auth tokens are being sent properly

### Environment Variables Not Loading

**In local development:**
```bash
# Restart dev server
pnpm dev
```

**In Amplify:**
1. Re-deploy the application
2. Check build logs for environment variable injection
3. Verify variables in Amplify Console

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

---

## Need Help?

If you encounter issues:

1. Check this guide first
2. Review the backend documentation in [`docs/`](./README.md)
3. Check application logs
4. Contact the development team

---

**Last Updated:** 2025-10-15
